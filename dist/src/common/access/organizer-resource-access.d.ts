import { OrganizerRole } from '@prisma/client';
export declare function canAccessOrganizerResource(userOrganizerId: string, resourceOrganizerId: string, role: OrganizerRole, sellerEventIds: string[], resourceEventId: string): boolean;
