"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAllowedCreateStatus = assertAllowedCreateStatus;
exports.isEventLocked = isEventLocked;
exports.assertValidStatusTransition = assertValidStatusTransition;
const client_1 = require("@prisma/client");
const api_exception_1 = require("../common/exceptions/api.exception");
const common_1 = require("@nestjs/common");
const ALLOWED_ON_CREATE = [
    client_1.EventStatus.draft,
    client_1.EventStatus.scheduled,
];
function assertAllowedCreateStatus(status) {
    if (status === undefined) {
        return;
    }
    if (!ALLOWED_ON_CREATE.includes(status)) {
        throw new api_exception_1.ApiException('INVALID_EVENT_STATUS', 'New events may only be created as draft or scheduled.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
function isEventLocked(status) {
    return status === client_1.EventStatus.completed || status === client_1.EventStatus.cancelled;
}
function assertValidStatusTransition(from, to) {
    if (from === to) {
        return;
    }
    const allowed = {
        [client_1.EventStatus.draft]: [client_1.EventStatus.scheduled, client_1.EventStatus.cancelled],
        [client_1.EventStatus.scheduled]: [client_1.EventStatus.in_progress, client_1.EventStatus.cancelled],
        [client_1.EventStatus.in_progress]: [client_1.EventStatus.completed],
        [client_1.EventStatus.completed]: [],
        [client_1.EventStatus.cancelled]: [],
    };
    if (!allowed[from].includes(to)) {
        throw new api_exception_1.ApiException('INVALID_STATUS_TRANSITION', `Cannot change event status from "${from}" to "${to}".`, common_1.HttpStatus.CONFLICT);
    }
}
//# sourceMappingURL=event-status.policy.js.map