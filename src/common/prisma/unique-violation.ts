import { Prisma } from '@prisma/client';

/** True when Prisma reports a unique constraint violation (e.g. duplicate draw ball). */
export function isPrismaUniqueViolation(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
