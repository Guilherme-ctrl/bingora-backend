import { EventOperationalRole } from "@prisma/client";
import { hasRoundActionPermission } from "./event-roles.policy";

describe("event-roles.policy", () => {
  it("allows admin_evento to manage round lifecycle", () => {
    const roles = [EventOperationalRole.admin_evento];
    expect(hasRoundActionPermission("round.create", roles)).toBe(true);
    expect(hasRoundActionPermission("round.open_sales", roles)).toBe(true);
    expect(hasRoundActionPermission("round.close_sales", roles)).toBe(true);
    expect(hasRoundActionPermission("round.start_draw", roles)).toBe(true);
    expect(hasRoundActionPermission("round.finish", roles)).toBe(true);
  });

  it("allows mesario only in draw/finish checkpoints", () => {
    const roles = [EventOperationalRole.mesario];
    expect(hasRoundActionPermission("round.start_draw", roles)).toBe(true);
    expect(hasRoundActionPermission("round.finish", roles)).toBe(true);
    expect(hasRoundActionPermission("round.create", roles)).toBe(false);
  });

  it("denies vendedor in round transitions", () => {
    const roles = [EventOperationalRole.vendedor];
    expect(hasRoundActionPermission("round.open_sales", roles)).toBe(false);
    expect(hasRoundActionPermission("round.start_draw", roles)).toBe(false);
  });
});
