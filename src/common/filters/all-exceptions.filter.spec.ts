import { BadRequestException, HttpStatus } from "@nestjs/common";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import { ApiException } from "../exceptions/api.exception";

describe("AllExceptionsFilter", () => {
  const filter = new AllExceptionsFilter();

  function mockHost(
    onJson: (b: unknown) => void,
    onStatus: (c: number) => void,
  ) {
    return {
      switchToHttp: () => ({
        getResponse: () => {
          const res = {
            status: (c: number) => {
              onStatus(c);
              return res;
            },
            json: (b: unknown) => {
              onJson(b);
            },
          };
          return res;
        },
        getRequest: () => ({ method: "GET", url: "/api/v1/test" }),
      }),
    };
  }

  it("passes through ApiException bodies unchanged", () => {
    let code = 0;
    let body: unknown;
    const host = mockHost(
      (b) => {
        body = b;
      },
      (c) => {
        code = c;
      },
    );

    const ex = new ApiException("TEST", "hello", HttpStatus.CONFLICT, {
      foo: 1,
    });

    filter.catch(ex, host as never);

    expect(code).toBe(409);
    expect(body).toEqual({
      error: {
        code: "TEST",
        message: "hello",
        details: { foo: 1 },
      },
    });
  });

  it("normalizes class-validator style BadRequestException", () => {
    let body: unknown;
    let statusCode = 0;
    const host = mockHost(
      (b) => {
        body = b;
      },
      (c) => {
        statusCode = c;
      },
    );

    filter.catch(
      new BadRequestException({
        message: ["email must be an email", "password is too short"],
        error: "Bad Request",
        statusCode: 400,
      }),
      host as never,
    );

    expect(statusCode).toBe(400);
    expect(body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "email must be an email; password is too short",
        details: {
          messages: ["email must be an email", "password is too short"],
        },
      },
    });
  });
});
