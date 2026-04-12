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
exports.EventsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const seller_forbidden_guard_1 = require("../auth/seller-forbidden.guard");
const current_organizer_decorator_1 = require("../organizers/current-organizer.decorator");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const list_events_query_dto_1 = require("./dto/list-events-query.dto");
let EventsController = class EventsController {
    events;
    constructor(events) {
        this.events = events;
    }
    async list(user, query) {
        return this.events.list(user.organizerId, query, user.role, user.sellerEventIds);
    }
    async create(user, dto) {
        return this.events.create(user.organizerId, dto);
    }
    async getById(user, eventId) {
        return this.events.getById(user.organizerId, user.role, eventId, user.sellerEventIds);
    }
    async update(user, eventId, dto) {
        return this.events.update(user.organizerId, user.role, eventId, dto, user.sellerEventIds);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List my events (paginated)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_events_query_dto_1.ListEventsQueryDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create event' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event by id' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':eventId'),
    (0, common_1.UseGuards)(seller_forbidden_guard_1.SellerForbiddenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update event (partial)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_organizer_decorator_1.CurrentOrganizer)()),
    __param(1, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('events'),
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map