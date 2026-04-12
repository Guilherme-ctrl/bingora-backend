import { Prisma } from "@prisma/client";
import { isPrismaUniqueViolation } from "./unique-violation";

describe("isPrismaUniqueViolation", () => {
  it("returns true for Prisma P2002 (duplicate key)", () => {
    const err = new Prisma.PrismaClientKnownRequestError("Unique", {
      code: "P2002",
      clientVersion: "test",
      meta: { target: ["draw_session_id", "ball_number"] },
    });
    expect(isPrismaUniqueViolation(err)).toBe(true);
  });

  it("returns false for other Prisma codes", () => {
    const err = new Prisma.PrismaClientKnownRequestError("FK", {
      code: "P2003",
      clientVersion: "test",
      meta: {},
    });
    expect(isPrismaUniqueViolation(err)).toBe(false);
  });

  it("returns false for non-Prisma errors", () => {
    expect(isPrismaUniqueViolation(new Error("x"))).toBe(false);
    expect(isPrismaUniqueViolation(null)).toBe(false);
  });
});
