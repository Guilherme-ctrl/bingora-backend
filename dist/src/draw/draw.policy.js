"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUseDrawForEvent = canUseDrawForEvent;
exports.assertBallNumberInRange = assertBallNumberInRange;
const client_1 = require("@prisma/client");
function canUseDrawForEvent(status) {
    return status === client_1.EventStatus.scheduled || status === client_1.EventStatus.in_progress;
}
function assertBallNumberInRange(ballNumber) {
    if (!Number.isInteger(ballNumber) || ballNumber < 1 || ballNumber > 75) {
        throw new Error('ball_number must be an integer from 1 to 75');
    }
}
//# sourceMappingURL=draw.policy.js.map