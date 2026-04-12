"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiException = void 0;
const common_1 = require("@nestjs/common");
class ApiException extends common_1.HttpException {
    constructor(code, message, status, details = {}) {
        const body = { error: { code, message, details } };
        super(body, status);
    }
}
exports.ApiException = ApiException;
//# sourceMappingURL=api.exception.js.map