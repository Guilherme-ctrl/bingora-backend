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
exports.EventSellersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const event_sellers_service_1 = require("./event-sellers.service");
const add_event_seller_dto_1 = require("./dto/add-event-seller.dto");
let EventSellersController = class EventSellersController {
    eventSellers;
    constructor(eventSellers) {
        this.eventSellers = eventSellers;
    }
    async list(user, eventId) {
        return this.eventSellers.listForEvent(user.organizerId, user.role, eventId, user.sellerEventIds);
    }
    async add(user, eventId, dto) {
        return this.eventSellers.addToEvent(user.organizerId, user.role, eventId, dto, user.sellerEventIds);
    }
    async remove(user, eventId, sellerOrganizerId) {
        await this.eventSellers.removeFromEvent(user.organizerId, user.role, eventId, sellerOrganizerId, user.sellerEventIds);
    }
};
exports.EventSellersController = EventSellersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List sellers assigned to this event (event owner / admin)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventSellersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Add a seller to this event (creates seller account if needed)',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_event_seller_dto_1.AddEventSellerDto]),
    __metadata("design:returntype", Promise)
], EventSellersController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)(':sellerOrganizerId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove seller assignment from this event' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('sellerOrganizerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EventSellersController.prototype, "remove", null);
exports.EventSellersController = EventSellersController = __decorate([
    (0, swagger_1.ApiTags)('event-sellers'),
    (0, common_1.Controller)('events/:eventId/sellers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [event_sellers_service_1.EventSellersService])
], EventSellersController);
//# sourceMappingURL=event-sellers.controller.js.map