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
exports.DrawController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const draw_service_1 = require("./draw.service");
const post_call_dto_1 = require("./dto/post-call.dto");
let DrawController = class DrawController {
    draw;
    constructor(draw) {
        this.draw = draw;
    }
    async startSession(user, eventId, res) {
        const { session, created } = await this.draw.ensureSession(user.organizerId, user.role, eventId, user.sellerEventIds);
        res.status(created ? common_1.HttpStatus.CREATED : common_1.HttpStatus.OK);
        return session;
    }
    async postCall(user, eventId, dto) {
        return this.draw.postCall(user.organizerId, user.role, eventId, dto, user.sellerEventIds);
    }
    async deleteLast(user, eventId) {
        await this.draw.deleteLastCall(user.organizerId, user.role, eventId, user.sellerEventIds);
    }
    async getState(user, eventId) {
        return this.draw.getDrawState(user.organizerId, user.role, eventId, user.sellerEventIds);
    }
    async close(user, eventId) {
        return this.draw.closeSession(user.organizerId, user.role, eventId, user.sellerEventIds);
    }
};
exports.DrawController = DrawController;
__decorate([
    (0, common_1.Post)('session'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create draw session if missing (idempotent when open)',
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)('calls'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Record a called ball (1–75), unique per session' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, post_call_dto_1.PostCallDto]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "postCall", null);
__decorate([
    (0, common_1.Delete)('calls/last'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove the last call (open session only)' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "deleteLast", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Draw session, calls in order, and remaining numbers 1–75',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "getState", null);
__decorate([
    (0, common_1.Post)('close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close the draw session' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "close", null);
exports.DrawController = DrawController = __decorate([
    (0, swagger_1.ApiTags)('draw'),
    (0, common_1.Controller)('events/:eventId/draw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [draw_service_1.DrawService])
], DrawController);
//# sourceMappingURL=draw.controller.js.map