"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrismaUniqueViolation = isPrismaUniqueViolation;
const client_1 = require("@prisma/client");
function isPrismaUniqueViolation(error) {
    return (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002');
}
//# sourceMappingURL=unique-violation.js.map