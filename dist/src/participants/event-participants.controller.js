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
exports.EventParticipantsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const participants_service_1 = require("./participants.service");
const create_participant_dto_1 = require("./dto/create-participant.dto");
const list_participants_query_dto_1 = require("./dto/list-participants-query.dto");
let EventParticipantsController = class EventParticipantsController {
    participants;
    constructor(participants) {
        this.participants = participants;
    }
    async list(user, eventId, query) {
        return this.participants.list(user.organizerId, user.role, eventId, query, user.sellerEventIds);
    }
    async create(user, eventId, dto) {
        return this.participants.create(user.organizerId, user.role, eventId, dto, user.sellerEventIds);
    }
};
exports.EventParticipantsController = EventParticipantsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List participants for an event (paginated)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, list_participants_query_dto_1.ListParticipantsQueryDto]),
    __metadata("design:returntype", Promise)
], EventParticipantsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create participant' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_participant_dto_1.CreateParticipantDto]),
    __metadata("design:returntype", Promise)
], EventParticipantsController.prototype, "create", null);
exports.EventParticipantsController = EventParticipantsController = __decorate([
    (0, swagger_1.ApiTags)('participants'),
    (0, common_1.Controller)('events/:eventId/participants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [participants_service_1.ParticipantsService])
], EventParticipantsController);
//# sourceMappingURL=event-participants.controller.js.map