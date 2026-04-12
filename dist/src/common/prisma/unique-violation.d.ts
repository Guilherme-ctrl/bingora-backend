import { Prisma } from '@prisma/client';
export declare function isPrismaUniqueViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError;
