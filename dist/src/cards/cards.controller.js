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
exports.CardsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const cards_service_1 = require("./cards.service");
const generate_cards_dto_1 = require("./dto/generate-cards.dto");
const list_cards_query_dto_1 = require("./dto/list-cards-query.dto");
const export_cards_query_dto_1 = require("./dto/export-cards-query.dto");
let CardsController = class CardsController {
    cards;
    constructor(cards) {
        this.cards = cards;
    }
    async generate(user, eventId, dto) {
        return this.cards.generate(user.organizerId, user.role, eventId, dto, user.sellerEventIds);
    }
    async export(user, eventId, query, res) {
        const format = query.format ?? 'json';
        if (format === 'csv') {
            const csv = await this.cards.exportCsv(user.organizerId, user.role, eventId, user.sellerEventIds);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="bingo-cards-${eventId}.csv"`);
            return csv;
        }
        const data = await this.cards.exportJson(user.organizerId, user.role, eventId, user.sellerEventIds);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="bingo-cards-${eventId}.json"`);
        return data;
    }
    async list(user, eventId, query) {
        return this.cards.list(user.organizerId, user.role, eventId, query, user.sellerEventIds);
    }
};
exports.CardsController = CardsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate unique bingo cards for an event (once per event in MVP)',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, generate_cards_dto_1.GenerateCardsDto]),
    __metadata("design:returntype", Promise)
], CardsController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export all cards for printing',
        description: '`format=json` returns a JSON array of card objects. `format=csv` returns CSV with a grid_json column suitable for tooling/PDF pipelines.',
    }),
    (0, swagger_1.ApiProduces)('application/json', 'text/csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, export_cards_query_dto_1.ExportCardsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], CardsController.prototype, "export", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    (0, swagger_1.ApiOperation)({
        summary: 'List cards (paginated). Use status=available to list only unsold cards.',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, list_cards_query_dto_1.ListCardsQueryDto]),
    __metadata("design:returntype", Promise)
], CardsController.prototype, "list", null);
exports.CardsController = CardsController = __decorate([
    (0, swagger_1.ApiTags)('cards'),
    (0, common_1.Controller)('events/:eventId/cards'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [cards_service_1.CardsService])
], CardsController);
//# sourceMappingURL=cards.controller.js.map