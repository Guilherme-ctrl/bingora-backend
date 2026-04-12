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
exports.EventPrizesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const prizes_service_1 = require("./prizes.service");
const create_prize_dto_1 = require("./dto/create-prize.dto");
let EventPrizesController = class EventPrizesController {
    prizes;
    constructor(prizes) {
        this.prizes = prizes;
    }
    async list(user, eventId) {
        return this.prizes.listByEvent(user.organizerId, user.role, eventId, user.sellerEventIds);
    }
    async create(user, eventId, dto) {
        return this.prizes.create(user.organizerId, user.role, eventId, dto, user.sellerEventIds);
    }
};
exports.EventPrizesController = EventPrizesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List prizes for an event' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventPrizesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create prize' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_prize_dto_1.CreatePrizeDto]),
    __metadata("design:returntype", Promise)
], EventPrizesController.prototype, "create", null);
exports.EventPrizesController = EventPrizesController = __decorate([
    (0, swagger_1.ApiTags)('prizes'),
    (0, common_1.Controller)('events/:eventId/prizes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prizes_service_1.PrizesService])
], EventPrizesController);
//# sourceMappingURL=event-prizes.controller.js.map