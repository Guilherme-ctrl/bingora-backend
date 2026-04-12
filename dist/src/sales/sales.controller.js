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
exports.SalesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const sales_service_1 = require("./sales.service");
const update_sale_dto_1 = require("./dto/update-sale.dto");
const void_sale_dto_1 = require("./dto/void-sale.dto");
let SalesController = class SalesController {
    sales;
    constructor(sales) {
        this.sales = sales;
    }
    async getById(user, saleId) {
        return this.sales.getById(user.organizerId, user.role, saleId, user.sellerEventIds);
    }
    async update(user, saleId, dto) {
        return this.sales.update(user.organizerId, user.role, saleId, dto, user.sellerEventIds);
    }
    async voidSale(user, saleId, body) {
        void body.reason;
        return this.sales.void(user.organizerId, user.role, saleId, user.sellerEventIds);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Get)(':saleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale detail including assigned cards' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('saleId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':saleId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update sale (payment fields, notes)',
        description: 'Use `payment_status` to mark paid or unpaid.',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('saleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_sale_dto_1.UpdateSaleDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':saleId/void'),
    (0, swagger_1.ApiOperation)({
        summary: 'Void sale and release cards back to available',
        description: 'Request body `reason` is accepted for clients; not persisted in MVP.',
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('saleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void_sale_dto_1.VoidSaleDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "voidSale", null);
exports.SalesController = SalesController = __decorate([
    (0, swagger_1.ApiTags)('sales'),
    (0, common_1.Controller)('sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map