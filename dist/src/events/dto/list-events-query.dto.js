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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEventsQueryDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ListEventsQueryDto {
    status;
    sort = 'starts_at';
    order = 'desc';
    page = 1;
    page_size = 25;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => Object }, sort: { required: true, type: () => Object, default: "starts_at", enum: ['starts_at', 'created_at'] }, order: { required: true, type: () => Object, default: "desc", enum: ['asc', 'desc'] }, page: { required: true, type: () => Object, default: 1, minimum: 1 }, page_size: { required: true, type: () => Object, default: 25, minimum: 1, maximum: 100 } };
    }
}
exports.ListEventsQueryDto = ListEventsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.EventStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EventStatus),
    __metadata("design:type", String)
], ListEventsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['starts_at', 'created_at'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['starts_at', 'created_at']),
    __metadata("design:type", String)
], ListEventsQueryDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['asc', 'desc'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], ListEventsQueryDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], ListEventsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 25, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Object)
], ListEventsQueryDto.prototype, "page_size", void 0);
//# sourceMappingURL=list-events-query.dto.js.map