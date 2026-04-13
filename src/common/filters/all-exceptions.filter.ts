import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/node";
import type { Request, Response } from "express";
import type { ApiErrorBody } from "../exceptions/api.exception";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiErrorBody;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (this.isApiErrorBody(res)) {
        body = res;
      } else if (typeof res === "string") {
        body = {
          error: {
            code: "HTTP_EXCEPTION",
            message: res,
            details: {},
          },
        };
      } else if (typeof res === "object" && res !== null && "message" in res) {
        const msg = (res as { message?: string | string[] }).message;
        const messages = Array.isArray(msg)
          ? msg
          : msg != null
            ? [msg]
            : [exception.message];
        const message = messages.join("; ");
        body = {
          error: {
            code: "VALIDATION_ERROR",
            message,
            details: { messages },
          },
        };
        if (status === HttpStatus.BAD_REQUEST) {
          body.error.code = "VALIDATION_ERROR";
        }
      } else {
        body = {
          error: {
            code: "HTTP_EXCEPTION",
            message: exception.message,
            details: {},
          },
        };
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.CONFLICT;
      body = {
        error: {
          code: "DATABASE_ERROR",
          message: "A database constraint was violated.",
          details: { prisma_code: exception.code },
        },
      };
      if (exception.code === "P2002") {
        status = HttpStatus.CONFLICT;
        body.error.code = "UNIQUE_VIOLATION";
        body.error.message = "A record with this value already exists.";
      }
      if (exception.code === "P2025") {
        status = HttpStatus.NOT_FOUND;
        body.error.code = "NOT_FOUND";
        body.error.message = "Record not found.";
      }
    } else {
      const message =
        exception instanceof Error
          ? exception.message
          : "Internal server error";
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
      body = {
        error: {
          code: "INTERNAL_ERROR",
          message:
            status === HttpStatus.INTERNAL_SERVER_ERROR
              ? "Internal server error"
              : message,
          details: {},
        },
      };
    }

    const path = `${request.method} ${request.url}`;
    const requestId = request.header("x-request-id");
    this.logger.warn(
      `${path} -> ${status} ${body.error.code}: ${body.error.message}`,
    );

    const shouldCapture =
      status >= HttpStatus.INTERNAL_SERVER_ERROR ||
      body.error.code === "HTTP_EXCEPTION";
    if (shouldCapture) {
      Sentry.withScope((scope) => {
        scope.setTag("app", "backend");
        scope.setTag("http_status", String(status));
        scope.setTag("error_code", body.error.code);
        scope.setTag("route", `${request.method} ${request.path}`);
        if (requestId) scope.setTag("request_id", requestId);
        scope.setContext("http", {
          method: request.method,
          url: request.url,
          status,
        });
        Sentry.captureException(
          exception instanceof Error ? exception : new Error(String(exception)),
        );
      });
    }

    response.status(status).json(body);
  }

  private isApiErrorBody(value: unknown): value is ApiErrorBody {
    if (typeof value !== "object" || value === null) return false;
    const v = value as ApiErrorBody;
    return (
      typeof v.error?.code === "string" &&
      typeof v.error?.message === "string" &&
      typeof v.error?.details === "object" &&
      v.error.details !== null
    );
  }
}
