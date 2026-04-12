import { HttpException, HttpStatus } from "@nestjs/common";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
};

export class ApiException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus,
    details: Record<string, unknown> = {},
  ) {
    const body: ApiErrorBody = { error: { code, message, details } };
    super(body, status);
  }
}
