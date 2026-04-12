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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const event_status_policy_1 = require("./event-status.policy");
const organizerEmailInclude = {
    organizer: { select: { email: true } },
};
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(organizerId, query, role, sellerEventIds) {
        const page = query.page ?? 1;
        const page_size = query.page_size ?? 25;
        const where = {};
        if (role === client_1.OrganizerRole.seller) {
            if (sellerEventIds.length === 0) {
                return { items: [], page, page_size, total: 0 };
            }
            where.id = { in: sellerEventIds };
        }
        else if (role !== client_1.OrganizerRole.admin) {
            where.organizerId = organizerId;
        }
        if (query.status !== undefined) {
            where.status = query.status;
        }
        const sortField = query.sort ?? 'starts_at';
        const order = query.order ?? 'desc';
        const orderBy = sortField === 'created_at' ? { createdAt: order } : { startsAt: order };
        const skip = (page - 1) * page_size;
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.event.findMany({
                where,
                orderBy,
                skip,
                take: page_size,
                include: organizerEmailInclude,
            }),
            this.prisma.event.count({ where }),
        ]);
        return {
            items: rows.map((e) => this.toResponse(e)),
            page,
            page_size,
            total,
        };
    }
    async create(organizerId, dto) {
        const status = dto.status ?? client_1.EventStatus.draft;
        (0, event_status_policy_1.assertAllowedCreateStatus)(status);
        const event = await this.prisma.event.create({
            data: {
                organizerId,
                title: dto.title,
                startsAt: new Date(dto.starts_at),
                timezone: dto.timezone,
                venueNotes: dto.venue_notes ?? null,
                defaultUnitPriceCents: dto.default_unit_price_cents ?? null,
                defaultCurrency: dto.default_currency ?? 'BRL',
                status,
            },
            include: organizerEmailInclude,
        });
        return this.toResponse(event);
    }
    async getById(organizerId, role, eventId, sellerEventIds) {
        const event = await this.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        return this.toResponse(event);
    }
    async update(organizerId, role, eventId, dto, sellerEventIds) {
        const existing = await this.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const hasPatch = this.updateDtoHasKeys(dto);
        if (!hasPatch) {
            return this.toResponse(existing);
        }
        if ((0, event_status_policy_1.isEventLocked)(existing.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'This event is completed or cancelled and cannot be modified.', common_1.HttpStatus.CONFLICT);
        }
        if (dto.status !== undefined) {
            (0, event_status_policy_1.assertValidStatusTransition)(existing.status, dto.status);
        }
        const data = {};
        if (dto.title !== undefined) {
            data.title = dto.title;
        }
        if (dto.starts_at !== undefined) {
            data.startsAt = new Date(dto.starts_at);
        }
        if (dto.timezone !== undefined) {
            data.timezone = dto.timezone;
        }
        if (dto.venue_notes !== undefined) {
            data.venueNotes = dto.venue_notes;
        }
        if (dto.status !== undefined) {
            data.status = dto.status;
        }
        if (dto.default_unit_price_cents !== undefined) {
            data.defaultUnitPriceCents = dto.default_unit_price_cents;
        }
        if (dto.default_currency !== undefined) {
            data.defaultCurrency = dto.default_currency;
        }
        const updated = await this.prisma.event.update({
            where: { id: eventId },
            data,
            include: organizerEmailInclude,
        });
        return this.toResponse(updated);
    }
    async persistLogoUrl(organizerId, role, eventId, sellerEventIds, logoUrl) {
        const existing = await this.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        if ((0, event_status_policy_1.isEventLocked)(existing.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'This event is completed or cancelled and cannot be modified.', common_1.HttpStatus.CONFLICT);
        }
        if (logoUrl !== null) {
            const prefix = `/uploads/event-logos/${eventId}.`;
            if (!logoUrl.startsWith(prefix)) {
                throw new api_exception_1.ApiException('INVALID_LOGO_PATH', 'Invalid logo path.', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const updated = await this.prisma.event.update({
            where: { id: eventId },
            data: { logoUrl },
            include: organizerEmailInclude,
        });
        return this.toResponse(updated);
    }
    async findEventForAccess(organizerId, role, eventId, sellerEventIds) {
        if (role === client_1.OrganizerRole.admin) {
            const event = await this.prisma.event.findUnique({
                where: { id: eventId },
                include: organizerEmailInclude,
            });
            if (!event) {
                throw new api_exception_1.ApiException('EVENT_NOT_FOUND', 'Event not found.', common_1.HttpStatus.NOT_FOUND);
            }
            return event;
        }
        if (role === client_1.OrganizerRole.seller) {
            if (!sellerEventIds.includes(eventId)) {
                throw new api_exception_1.ApiException('EVENT_NOT_FOUND', 'Event not found.', common_1.HttpStatus.NOT_FOUND);
            }
            const event = await this.prisma.event.findUnique({
                where: { id: eventId },
                include: organizerEmailInclude,
            });
            if (!event) {
                throw new api_exception_1.ApiException('EVENT_NOT_FOUND', 'Event not found.', common_1.HttpStatus.NOT_FOUND);
            }
            return event;
        }
        return this.findOwnedOrThrow(organizerId, eventId);
    }
    async findOwnedOrThrow(organizerId, eventId) {
        const event = await this.prisma.event.findFirst({
            where: { id: eventId, organizerId },
            include: organizerEmailInclude,
        });
        if (!event) {
            throw new api_exception_1.ApiException('EVENT_NOT_FOUND', 'Event not found.', common_1.HttpStatus.NOT_FOUND);
        }
        return event;
    }
    updateDtoHasKeys(dto) {
        return (dto.title !== undefined ||
            dto.starts_at !== undefined ||
            dto.timezone !== undefined ||
            dto.venue_notes !== undefined ||
            dto.status !== undefined ||
            dto.default_unit_price_cents !== undefined ||
            dto.default_currency !== undefined);
    }
    toResponse(event) {
        return {
            id: event.id,
            organizer_id: event.organizerId,
            organizer_email: event.organizer.email,
            title: event.title,
            starts_at: event.startsAt.toISOString(),
            timezone: event.timezone,
            venue_notes: event.venueNotes,
            default_unit_price_cents: event.defaultUnitPriceCents,
            default_currency: event.defaultCurrency,
            logo_url: event.logoUrl,
            status: event.status,
            created_at: event.createdAt.toISOString(),
            updated_at: event.updatedAt.toISOString(),
        };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map