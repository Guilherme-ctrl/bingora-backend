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
exports.EventLogoController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const node_fs_1 = require("node:fs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const api_exception_1 = require("../common/exceptions/api.exception");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const events_service_1 = require("./events.service");
const event_logo_constants_1 = require("./event-logo.constants");
const event_status_policy_1 = require("./event-status.policy");
let EventLogoController = class EventLogoController {
    events;
    constructor(events) {
        this.events = events;
    }
    async uploadLogo(user, eventId, file) {
        if (!file?.buffer?.length) {
            throw new api_exception_1.ApiException('VALIDATION_ERROR', 'Envie um arquivo de imagem.', common_1.HttpStatus.BAD_REQUEST);
        }
        const ext = (0, event_logo_constants_1.extForImageMime)(file.mimetype);
        if (!ext) {
            throw new api_exception_1.ApiException('VALIDATION_ERROR', 'Formato não suportado. Use PNG, JPEG, WebP ou GIF.', common_1.HttpStatus.BAD_REQUEST);
        }
        const existing = await this.events.findEventForAccess(user.organizerId, user.role, eventId, user.sellerEventIds);
        if ((0, event_status_policy_1.isEventLocked)(existing.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'This event is completed or cancelled and cannot be modified.', common_1.HttpStatus.CONFLICT);
        }
        const newPublicPath = (0, event_logo_constants_1.publicEventLogoPath)(eventId, ext);
        const dir = (0, event_logo_constants_1.eventLogosAbsoluteDir)();
        (0, node_fs_1.mkdirSync)(dir, { recursive: true });
        const destAbs = `${dir}/${eventId}${ext}`;
        (0, event_logo_constants_1.safeUnlinkUpload)(existing.logoUrl);
        try {
            (0, node_fs_1.writeFileSync)(destAbs, file.buffer);
        }
        catch {
            throw new api_exception_1.ApiException('LOGO_WRITE_FAILED', 'Não foi possível salvar o arquivo.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            return await this.events.persistLogoUrl(user.organizerId, user.role, eventId, user.sellerEventIds, newPublicPath);
        }
        catch (err) {
            (0, event_logo_constants_1.safeUnlinkUpload)(newPublicPath);
            throw err;
        }
    }
    async deleteLogo(user, eventId) {
        const existing = await this.events.findEventForAccess(user.organizerId, user.role, eventId, user.sellerEventIds);
        if ((0, event_status_policy_1.isEventLocked)(existing.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'This event is completed or cancelled and cannot be modified.', common_1.HttpStatus.CONFLICT);
        }
        (0, event_logo_constants_1.safeUnlinkUpload)(existing.logoUrl);
        return this.events.persistLogoUrl(user.organizerId, user.role, eventId, user.sellerEventIds, null);
    }
};
exports.EventLogoController = EventLogoController;
__decorate([
    (0, common_1.Post)(':eventId/logo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar logo do evento (PNG, JPEG, WebP ou GIF; máx. 2 MB)',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: event_logo_constants_1.EVENT_LOGO_MAX_BYTES },
    })),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], EventLogoController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Delete)(':eventId/logo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remover logo do evento' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventLogoController.prototype, "deleteLogo", null);
exports.EventLogoController = EventLogoController = __decorate([
    (0, swagger_1.ApiTags)('events'),
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventLogoController);
//# sourceMappingURL=event-logo.controller.js.map