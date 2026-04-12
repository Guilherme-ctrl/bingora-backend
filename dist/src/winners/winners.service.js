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
exports.WinnersService = void 0;
const common_1 = require("@nestjs/common");
const organizer_resource_access_1 = require("../common/access/organizer-resource-access");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const events_service_1 = require("../events/events.service");
const event_status_policy_1 = require("../events/event-status.policy");
let WinnersService = class WinnersService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async list(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const rows = await this.prisma.winner.findMany({
            where: { eventId },
            orderBy: { recordedAt: 'desc' },
        });
        return { items: rows.map((w) => this.toResponse(w)) };
    }
    async create(organizerId, role, eventId, dto, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const prize = await this.prisma.prize.findFirst({
            where: { id: dto.prize_id, eventId },
        });
        if (!prize) {
            throw new api_exception_1.ApiException('PRIZE_NOT_FOUND', 'Prize not found for this event.', common_1.HttpStatus.NOT_FOUND);
        }
        const participant = await this.prisma.participant.findFirst({
            where: { id: dto.participant_id, eventId },
        });
        if (!participant) {
            throw new api_exception_1.ApiException('PARTICIPANT_NOT_FOUND', 'Participant not found for this event.', common_1.HttpStatus.NOT_FOUND);
        }
        if (dto.bingo_card_id) {
            const card = await this.prisma.bingoCard.findFirst({
                where: { id: dto.bingo_card_id, eventId },
            });
            if (!card) {
                throw new api_exception_1.ApiException('CARD_NOT_FOUND', 'Bingo card not found for this event.', common_1.HttpStatus.NOT_FOUND);
            }
        }
        const activeForPrize = await this.prisma.winner.findFirst({
            where: { prizeId: dto.prize_id, revokedAt: null },
        });
        if (activeForPrize) {
            throw new api_exception_1.ApiException('PRIZE_ALREADY_HAS_WINNER', 'An active winner already exists for this prize.', common_1.HttpStatus.CONFLICT);
        }
        const winner = await this.prisma.winner.create({
            data: {
                eventId,
                prizeId: dto.prize_id,
                participantId: dto.participant_id,
                bingoCardId: dto.bingo_card_id ?? null,
                notes: dto.notes ?? null,
            },
        });
        return this.toResponse(winner);
    }
    async revoke(organizerId, role, winnerId, sellerEventIds) {
        const winner = await this.prisma.winner.findFirst({
            where: { id: winnerId },
            include: { event: true },
        });
        if (!winner ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, winner.event.organizerId, role, sellerEventIds, winner.eventId)) {
            throw new api_exception_1.ApiException('WINNER_NOT_FOUND', 'Winner not found.', common_1.HttpStatus.NOT_FOUND);
        }
        if ((0, event_status_policy_1.isEventLocked)(winner.event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Winners cannot be revoked while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        if (winner.revokedAt) {
            return this.toResponse(winner);
        }
        const updated = await this.prisma.winner.update({
            where: { id: winnerId },
            data: { revokedAt: new Date() },
        });
        return this.toResponse(updated);
    }
    toResponse(w) {
        return {
            id: w.id,
            event_id: w.eventId,
            prize_id: w.prizeId,
            participant_id: w.participantId,
            bingo_card_id: w.bingoCardId,
            notes: w.notes,
            recorded_at: w.recordedAt.toISOString(),
            revoked_at: w.revokedAt ? w.revokedAt.toISOString() : null,
        };
    }
};
exports.WinnersService = WinnersService;
exports.WinnersService = WinnersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], WinnersService);
//# sourceMappingURL=winners.service.js.map