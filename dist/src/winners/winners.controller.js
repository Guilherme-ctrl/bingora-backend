"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinnersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const winners_service_1 = require("./winners.service");
const revoke_winner_dto_1 = require("./dto/revoke-winner.dto");
let WinnersController = class WinnersController {
    winners;
    constructor(winners) {
        this.winners = winners;
    }
    async revoke(user, winnerId, body) {
        void body.reason;
        return this.winners.revoke(user.organizerId, user.role, winnerId, user.sellerEventIds);
    }
};
exports.WinnersController = WinnersController;
__decorate([
    (0, common_1.Post)(':winnerId/revoke'),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke a winner',
        description: 'Body `reason` is accepted; not persisted in MVP.',
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('winnerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, revoke_winner_dto_1.RevokeWinnerDto]),
    __metadata("design:returntype", Promise)
], WinnersController.prototype, "revoke", null);
exports.WinnersController = WinnersController = __decorate([
    (0, swagger_1.ApiTags)('winners'),
    (0, common_1.Controller)('winners'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [winners_service_1.WinnersService])
], WinnersController);
//# sourceMappingURL=winners.controller.js.map