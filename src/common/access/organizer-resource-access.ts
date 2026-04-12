import { OrganizerRole } from "@prisma/client";

/**
 * `resourceEventId` — evento a que o recurso pertence (ex.: `sale.eventId`).
 * Para vendedores, o acesso exige que o evento esteja em `sellerEventIds`.
 */
export function canAccessOrganizerResource(
  userOrganizerId: string,
  resourceOrganizerId: string,
  role: OrganizerRole,
  sellerEventIds: string[],
  resourceEventId: string,
): boolean {
  if (role === OrganizerRole.admin) {
    return true;
  }
  if (role === OrganizerRole.seller) {
    return sellerEventIds.includes(resourceEventId);
  }
  return userOrganizerId === resourceOrganizerId;
}
