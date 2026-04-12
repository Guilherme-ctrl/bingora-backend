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
exports.AuthTokensResponseDto = exports.OrganizerPublicDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class OrganizerPublicDto {
    id;
    email;
    role;
    created_at;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, email: { required: true, type: () => String }, role: { required: true, type: () => Object }, created_at: { required: true, type: () => String } };
    }
}
exports.OrganizerPublicDto = OrganizerPublicDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrganizerPublicDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrganizerPublicDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.OrganizerRole, enumName: 'OrganizerRole' }),
    __metadata("design:type", String)
], OrganizerPublicDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrganizerPublicDto.prototype, "created_at", void 0);
class AuthTokensResponseDto {
    organizer;
    access_token;
    token_type;
    expires_in;
    static _OPENAPI_METADATA_FACTORY() {
        return { organizer: { required: true, type: () => require("./auth-response.dto").OrganizerPublicDto }, access_token: { required: true, type: () => String }, token_type: { required: true, type: () => String }, expires_in: { required: true, type: () => Number } };
    }
}
exports.AuthTokensResponseDto = AuthTokensResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: OrganizerPublicDto }),
    __metadata("design:type", OrganizerPublicDto)
], AuthTokensResponseDto.prototype, "organizer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthTokensResponseDto.prototype, "access_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bearer' }),
    __metadata("design:type", String)
], AuthTokensResponseDto.prototype, "token_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3600 }),
    __metadata("design:type", Number)
], AuthTokensResponseDto.prototype, "expires_in", void 0);
//# sourceMappingURL=auth-response.dto.js.map