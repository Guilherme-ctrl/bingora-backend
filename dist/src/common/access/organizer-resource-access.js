"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessOrganizerResource = canAccessOrganizerResource;
const client_1 = require("@prisma/client");
function canAccessOrganizerResource(userOrganizerId, resourceOrganizerId, role, sellerEventIds, resourceEventId) {
    if (role === client_1.OrganizerRole.admin) {
        return true;
    }
    if (role === client_1.OrganizerRole.seller) {
        return sellerEventIds.includes(resourceEventId);
    }
    return userOrganizerId === resourceOrganizerId;
}
//# sourceMappingURL=organizer-resource-access.js.map