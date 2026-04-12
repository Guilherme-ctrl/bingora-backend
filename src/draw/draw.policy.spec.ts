import { EventStatus } from "@prisma/client";
import { assertBallNumberInRange, canUseDrawForEvent } from "./draw.policy";

describe("draw.policy", () => {
  it("allows scheduled and in_progress for draw", () => {
    expect(canUseDrawForEvent(EventStatus.scheduled)).toBe(true);
    expect(canUseDrawForEvent(EventStatus.in_progress)).toBe(true);
  });

  it("disallows draft, completed, cancelled", () => {
    expect(canUseDrawForEvent(EventStatus.draft)).toBe(false);
    expect(canUseDrawForEvent(EventStatus.completed)).toBe(false);
    expect(canUseDrawForEvent(EventStatus.cancelled)).toBe(false);
  });

  it("validates ball_number range", () => {
    expect(() => assertBallNumberInRange(1)).not.toThrow();
    expect(() => assertBallNumberInRange(75)).not.toThrow();
    expect(() => assertBallNumberInRange(0)).toThrow();
    expect(() => assertBallNumberInRange(76)).toThrow();
    expect(() => assertBallNumberInRange(3.5)).toThrow();
  });
});
