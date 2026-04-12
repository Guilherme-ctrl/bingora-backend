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
exports.ParticipantsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const organizer_resource_access_1 = require("../common/access/organizer-resource-access");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const events_service_1 = require("../events/events.service");
const event_status_policy_1 = require("../events/event-status.policy");
let ParticipantsService = class ParticipantsService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async list(organizerId, role, eventId, query, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const page = query.page ?? 1;
        const page_size = query.page_size ?? 25;
        const skip = (page - 1) * page_size;
        const where = { eventId };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.participant.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: page_size,
            }),
            this.prisma.participant.count({ where }),
        ]);
        return {
            items: rows.map((p) => this.toResponse(p)),
            page,
            page_size,
            total,
        };
    }
    async create(organizerId, role, eventId, dto, sellerEventIds) {
        const event = await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        if ((0, event_status_policy_1.isEventLocked)(event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Participants cannot be modified while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        const participant = await this.prisma.participant.create({
            data: {
                eventId,
                displayName: dto.display_name,
                email: dto.email ?? null,
                phone: dto.phone ?? null,
                notes: dto.notes ?? null,
            },
        });
        return this.toResponse(participant);
    }
    async update(organizerId, role, participantId, dto, sellerEventIds) {
        const participant = await this.prisma.participant.findFirst({
            where: { id: participantId },
            include: { event: true },
        });
        if (!participant ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, participant.event.organizerId, role, sellerEventIds, participant.eventId)) {
            throw new api_exception_1.ApiException('PARTICIPANT_NOT_FOUND', 'Participant not found.', common_1.HttpStatus.NOT_FOUND);
        }
        if ((0, event_status_policy_1.isEventLocked)(participant.event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Participants cannot be modified while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        const hasPatch = dto.display_name !== undefined ||
            dto.email !== undefined ||
            dto.phone !== undefined ||
            dto.notes !== undefined;
        if (!hasPatch) {
            return this.toResponse(participant);
        }
        const updated = await this.prisma.participant.update({
            where: { id: participantId },
            data: {
                ...(dto.display_name !== undefined
                    ? { displayName: dto.display_name }
                    : {}),
                ...(dto.email !== undefined ? { email: dto.email } : {}),
                ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            },
        });
        return this.toResponse(updated);
    }
    async delete(organizerId, role, participantId, sellerEventIds) {
        const participant = await this.prisma.participant.findFirst({
            where: { id: participantId },
            include: { event: true },
        });
        if (!participant ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, participant.event.organizerId, role, sellerEventIds, participant.eventId)) {
            throw new api_exception_1.ApiException('PARTICIPANT_NOT_FOUND', 'Participant not found.', common_1.HttpStatus.NOT_FOUND);
        }
        if ((0, event_status_policy_1.isEventLocked)(participant.event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Participants cannot be modified while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        const activeSale = await this.prisma.sale.findFirst({
            where: { participantId, status: client_1.SaleStatus.active },
        });
        if (activeSale) {
            throw new api_exception_1.ApiException('PARTICIPANT_HAS_ACTIVE_SALES', 'Cannot delete a participant that has active sales.', common_1.HttpStatus.CONFLICT);
        }
        await this.prisma.participant.delete({ where: { id: participantId } });
    }
    toResponse(p) {
        return {
            id: p.id,
            event_id: p.eventId,
            display_name: p.displayName,
            email: p.email,
            phone: p.phone,
            notes: p.notes,
            created_at: p.createdAt.toISOString(),
            updated_at: p.updatedAt.toISOString(),
        };
    }
};
exports.ParticipantsService = ParticipantsService;
exports.ParticipantsService = ParticipantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], ParticipantsService);
//# sourceMappingURL=participants.service.js.map