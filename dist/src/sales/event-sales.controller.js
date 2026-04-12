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
exports.EventSalesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const cards_service_1 = require("../cards/cards.service");
const sales_service_1 = require("./sales.service");
const create_sale_dto_1 = require("./dto/create-sale.dto");
const list_sales_query_dto_1 = require("./dto/list-sales-query.dto");
let EventSalesController = class EventSalesController {
    sales;
    cards;
    constructor(sales, cards) {
        this.sales = sales;
        this.cards = cards;
    }
    async availableSerials(user, eventId) {
        return this.cards.listAvailableSerialNumbers(user.organizerId, user.role, eventId, user.sellerEventIds);
    }
    async list(user, eventId, query) {
        return this.sales.listByEvent(user.organizerId, user.role, eventId, query, user.sellerEventIds);
    }
    async create(user, eventId, dto) {
        return this.sales.create(user.organizerId, user.role, eventId, dto, user.sellerEventIds);
    }
};
exports.EventSalesController = EventSalesController;
__decorate([
    (0, common_1.Get)('available-serials'),
    (0, swagger_1.ApiOperation)({
        summary: 'Números de série das cartelas ainda disponíveis (para escolher na venda)',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventSalesController.prototype, "availableSerials", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List sales for an event (paginated; card lines omitted — use GET /sales/:id)',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, list_sales_query_dto_1.ListSalesQueryDto]),
    __metadata("design:returntype", Promise)
], EventSalesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create sale and assign bingo cards (optional serial_numbers to pick specific cards)',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_sale_dto_1.CreateSaleDto]),
    __metadata("design:returntype", Promise)
], EventSalesController.prototype, "create", null);
exports.EventSalesController = EventSalesController = __decorate([
    (0, swagger_1.ApiTags)('sales'),
    (0, common_1.Controller)('events/:eventId/sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [sales_service_1.SalesService,
        cards_service_1.CardsService])
], EventSalesController);
//# sourceMappingURL=event-sales.controller.js.map