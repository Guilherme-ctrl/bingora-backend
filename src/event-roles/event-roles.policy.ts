import { EventOperationalRole } from "@prisma/client";

type RoundAction =
  | "round.create"
  | "round.open_sales"
  | "round.close_sales"
  | "round.start_draw"
  | "round.finish";

const ALLOWED_ROLES_BY_ACTION: Record<RoundAction, EventOperationalRole[]> = {
  "round.create": [EventOperationalRole.admin_evento],
  "round.open_sales": [EventOperationalRole.admin_evento],
  "round.close_sales": [EventOperationalRole.admin_evento],
  "round.start_draw": [EventOperationalRole.admin_evento, EventOperationalRole.mesario],
  "round.finish": [EventOperationalRole.admin_evento, EventOperationalRole.mesario],
};

export function hasRoundActionPermission(
  action: RoundAction,
  roles: EventOperationalRole[],
): boolean {
  const allowed = ALLOWED_ROLES_BY_ACTION[action];
  return roles.some((role) => allowed.includes(role));
}
