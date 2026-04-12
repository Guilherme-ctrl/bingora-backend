"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let body;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (this.isApiErrorBody(res)) {
                body = res;
            }
            else if (typeof res === 'string') {
                body = {
                    error: {
                        code: 'HTTP_EXCEPTION',
                        message: res,
                        details: {},
                    },
                };
            }
            else if (typeof res === 'object' && res !== null && 'message' in res) {
                const msg = res.message;
                const messages = Array.isArray(msg)
                    ? msg
                    : msg != null
                        ? [msg]
                        : [exception.message];
                const message = messages.join('; ');
                body = {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message,
                        details: { messages },
                    },
                };
                if (status === common_1.HttpStatus.BAD_REQUEST) {
                    body.error.code = 'VALIDATION_ERROR';
                }
            }
            else {
                body = {
                    error: {
                        code: 'HTTP_EXCEPTION',
                        message: exception.message,
                        details: {},
                    },
                };
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            status = common_1.HttpStatus.CONFLICT;
            body = {
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'A database constraint was violated.',
                    details: { prisma_code: exception.code },
                },
            };
            if (exception.code === 'P2002') {
                status = common_1.HttpStatus.CONFLICT;
                body.error.code = 'UNIQUE_VIOLATION';
                body.error.message = 'A record with this value already exists.';
            }
            if (exception.code === 'P2025') {
                status = common_1.HttpStatus.NOT_FOUND;
                body.error.code = 'NOT_FOUND';
                body.error.message = 'Record not found.';
            }
        }
        else {
            const message = exception instanceof Error
                ? exception.message
                : 'Internal server error';
            this.logger.error(exception instanceof Error ? exception.stack : String(exception));
            body = {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: status === common_1.HttpStatus.INTERNAL_SERVER_ERROR
                        ? 'Internal server error'
                        : message,
                    details: {},
                },
            };
        }
        const path = `${request.method} ${request.url}`;
        this.logger.warn(`${path} -> ${status} ${body.error.code}: ${body.error.message}`);
        response.status(status).json(body);
    }
    isApiErrorBody(value) {
        if (typeof value !== 'object' || value === null)
            return false;
        const v = value;
        return (typeof v.error?.code === 'string' &&
            typeof v.error?.message === 'string' &&
            typeof v.error?.details === 'object' &&
            v.error.details !== null);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map