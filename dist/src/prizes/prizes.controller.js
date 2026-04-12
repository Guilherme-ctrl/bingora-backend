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
exports.PrizesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const prizes_service_1 = require("./prizes.service");
const update_prize_dto_1 = require("./dto/update-prize.dto");
let PrizesController = class PrizesController {
    prizes;
    constructor(prizes) {
        this.prizes = prizes;
    }
    async update(user, prizeId, dto) {
        return this.prizes.update(user.organizerId, user.role, prizeId, dto, user.sellerEventIds);
    }
    async delete(user, prizeId) {
        await this.prizes.delete(user.organizerId, user.role, prizeId, user.sellerEventIds);
    }
};
exports.PrizesController = PrizesController;
__decorate([
    (0, common_1.Patch)(':prizeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update prize' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('prizeId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_prize_dto_1.UpdatePrizeDto]),
    __metadata("design:returntype", Promise)
], PrizesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':prizeId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete prize' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('prizeId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PrizesController.prototype, "delete", null);
exports.PrizesController = PrizesController = __decorate([
    (0, swagger_1.ApiTags)('prizes'),
    (0, common_1.Controller)('prizes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prizes_service_1.PrizesService])
], PrizesController);
//# sourceMappingURL=prizes.controller.js.map