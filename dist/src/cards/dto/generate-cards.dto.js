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
exports.GenerateCardsDto = exports.US_75_BALL_5X5 = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.US_75_BALL_5X5 = 'us_75_ball_5x5';
class GenerateCardsDto {
    count;
    ruleset;
    static _OPENAPI_METADATA_FACTORY() {
        return { count: { required: true, type: () => Number, minimum: 1, maximum: 10000 }, ruleset: { required: true, type: () => String } };
    }
}
exports.GenerateCardsDto = GenerateCardsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, minimum: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10_000),
    __metadata("design:type", Number)
], GenerateCardsDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: exports.US_75_BALL_5X5 }),
    (0, class_validator_1.Equals)(exports.US_75_BALL_5X5),
    __metadata("design:type", Object)
], GenerateCardsDto.prototype, "ruleset", void 0);
//# sourceMappingURL=generate-cards.dto.js.map