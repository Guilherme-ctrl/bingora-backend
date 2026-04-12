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
exports.PrizesService = void 0;
const common_1 = require("@nestjs/common");
const organizer_resource_access_1 = require("../common/access/organizer-resource-access");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const events_service_1 = require("../events/events.service");
const event_status_policy_1 = require("../events/event-status.policy");
let PrizesService = class PrizesService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async listByEvent(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const prizes = await this.prisma.prize.findMany({
            where: { eventId },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return { items: prizes.map((p) => this.toResponse(p)) };
    }
    async create(organizerId, role, eventId, dto, sellerEventIds) {
        const event = await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        if ((0, event_status_policy_1.isEventLocked)(event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Prizes cannot be modified while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        const prize = await this.prisma.prize.create({
            data: {
                eventId,
                name: dto.name,
                description: dto.description ?? null,
                sortOrder: dto.sort_order ?? 0,
            },
        });
        return this.toResponse(prize);
    }
    async update(organizerId, role, prizeId, dto, sellerEventIds) {
        const prize = await this.prisma.prize.findFirst({
            where: { id: prizeId },
            include: { event: true },
        });
        if (!prize ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, prize.event.organizerId, role, sellerEventIds, prize.eventId)) {
            throw new api_exception_1.ApiException('PRIZE_NOT_FOUND', 'Prize not found.', common_1.HttpStatus.NOT_FOUND);
        }
        if ((0, event_status_policy_1.isEventLocked)(prize.event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Prizes cannot be modified while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        const hasPatch = dto.name !== undefined ||
            dto.description !== undefined ||
            dto.sort_order !== undefined;
        if (!hasPatch) {
            return this.toResponse(prize);
        }
        const updated = await this.prisma.prize.update({
            where: { id: prizeId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.description !== undefined
                    ? { description: dto.description }
                    : {}),
                ...(dto.sort_order !== undefined ? { sortOrder: dto.sort_order } : {}),
            },
        });
        return this.toResponse(updated);
    }
    async delete(organizerId, role, prizeId, sellerEventIds) {
        const prize = await this.prisma.prize.findFirst({
            where: { id: prizeId },
            include: { event: true },
        });
        if (!prize ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, prize.event.organizerId, role, sellerEventIds, prize.eventId)) {
            throw new api_exception_1.ApiException('PRIZE_NOT_FOUND', 'Prize not found.', common_1.HttpStatus.NOT_FOUND);
        }
        if ((0, event_status_policy_1.isEventLocked)(prize.event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Prizes cannot be modified while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        const winnerRow = await this.prisma.winner.findFirst({
            where: { prizeId },
        });
        if (winnerRow) {
            throw new api_exception_1.ApiException('PRIZE_HAS_WINNER', 'Cannot delete a prize that is linked to winner records.', common_1.HttpStatus.CONFLICT);
        }
        await this.prisma.prize.delete({ where: { id: prizeId } });
    }
    toResponse(prize) {
        return {
            id: prize.id,
            event_id: prize.eventId,
            name: prize.name,
            description: prize.description,
            sort_order: prize.sortOrder,
            created_at: prize.createdAt.toISOString(),
            updated_at: prize.updatedAt.toISOString(),
        };
    }
};
exports.PrizesService = PrizesService;
exports.PrizesService = PrizesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], PrizesService);
//# sourceMappingURL=prizes.service.js.map