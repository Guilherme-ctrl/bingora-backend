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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const organizer_resource_access_1 = require("../common/access/organizer-resource-access");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const events_service_1 = require("../events/events.service");
const event_status_policy_1 = require("../events/event-status.policy");
let SalesService = class SalesService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async create(organizerId, role, eventId, dto, sellerEventIds) {
        const event = await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        if ((0, event_status_policy_1.isEventLocked)(event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'Sales cannot be created while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        const currency = dto.currency ?? 'USD';
        const result = await this.prisma.$transaction(async (tx) => {
            const participant = await tx.participant.findFirst({
                where: { id: dto.participant_id, eventId },
            });
            if (!participant) {
                throw new api_exception_1.ApiException('PARTICIPANT_NOT_FOUND', 'Participant not found for this event.', common_1.HttpStatus.NOT_FOUND);
            }
            const requestedSerials = dto.serial_numbers?.filter((n) => Number.isFinite(n) && n >= 1) ?? [];
            const useExplicitSerials = requestedSerials.length > 0;
            let cardsToAssign;
            if (useExplicitSerials) {
                if (requestedSerials.length !== dto.quantity) {
                    throw new api_exception_1.ApiException('SALE_SERIAL_COUNT_MISMATCH', `Informe exatamente ${dto.quantity} número(s) de cartela, ou omita serial_numbers para atribuir automaticamente.`, common_1.HttpStatus.BAD_REQUEST);
                }
                const uniq = new Set(requestedSerials);
                if (uniq.size !== requestedSerials.length) {
                    throw new api_exception_1.ApiException('DUPLICATE_SERIAL_IN_REQUEST', 'Números de cartela repetidos na solicitação.', common_1.HttpStatus.BAD_REQUEST);
                }
                const bySerial = await tx.bingoCard.findMany({
                    where: {
                        eventId,
                        serialNumber: { in: requestedSerials },
                    },
                });
                if (bySerial.length !== requestedSerials.length) {
                    const found = new Set(bySerial.map((c) => c.serialNumber));
                    const missing = requestedSerials.filter((s) => !found.has(s));
                    throw new api_exception_1.ApiException('CARD_SERIAL_NOT_FOUND', `Número(s) de cartela inexistente(s) neste evento: ${missing.join(', ')}.`, common_1.HttpStatus.NOT_FOUND);
                }
                const notAvail = bySerial.filter((c) => c.status !== client_1.BingoCardStatus.available);
                if (notAvail.length > 0) {
                    throw new api_exception_1.ApiException('CARD_NOT_AVAILABLE', `Cartela(s) não disponível(is): ${notAvail.map((c) => c.serialNumber).join(', ')}.`, common_1.HttpStatus.CONFLICT);
                }
                cardsToAssign = [...bySerial].sort((a, b) => a.serialNumber - b.serialNumber);
            }
            else {
                const available = await tx.bingoCard.findMany({
                    where: { eventId, status: client_1.BingoCardStatus.available },
                    orderBy: { serialNumber: 'asc' },
                    take: dto.quantity,
                });
                if (available.length < dto.quantity) {
                    throw new api_exception_1.ApiException('INSUFFICIENT_CARDS', 'Not enough available bingo cards for this sale.', common_1.HttpStatus.CONFLICT);
                }
                cardsToAssign = available;
            }
            const sale = await tx.sale.create({
                data: {
                    eventId,
                    participantId: dto.participant_id,
                    quantity: dto.quantity,
                    paymentStatus: dto.payment_status,
                    unitPriceCents: dto.unit_price_cents ?? null,
                    currency,
                    notes: dto.notes ?? null,
                    status: client_1.SaleStatus.active,
                },
            });
            for (const card of cardsToAssign) {
                await tx.saleCard.create({
                    data: {
                        saleId: sale.id,
                        bingoCardId: card.id,
                    },
                });
                await tx.bingoCard.update({
                    where: { id: card.id },
                    data: { status: client_1.BingoCardStatus.assigned },
                });
            }
            return await this.loadSaleResponse(tx, sale.id);
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
        });
        return result;
    }
    async listByEvent(organizerId, role, eventId, query, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const page = query.page ?? 1;
        const page_size = query.page_size ?? 25;
        const skip = (page - 1) * page_size;
        const where = { eventId };
        if (query.payment_status !== undefined) {
            where.paymentStatus = query.payment_status;
        }
        if (query.status !== undefined) {
            where.status = query.status;
        }
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.sale.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: page_size,
            }),
            this.prisma.sale.count({ where }),
        ]);
        return {
            items: rows.map((s) => this.toSummary(s)),
            page,
            page_size,
            total,
        };
    }
    async getById(organizerId, role, saleId, sellerEventIds) {
        const sale = await this.prisma.sale.findFirst({
            where: { id: saleId },
            include: {
                event: true,
                saleCards: { include: { bingoCard: true } },
            },
        });
        if (!sale ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, sale.event.organizerId, role, sellerEventIds, sale.eventId)) {
            throw new api_exception_1.ApiException('SALE_NOT_FOUND', 'Sale not found.', common_1.HttpStatus.NOT_FOUND);
        }
        return this.toResponse(sale, sale.saleCards);
    }
    async update(organizerId, role, saleId, dto, sellerEventIds) {
        const existing = await this.prisma.sale.findFirst({
            where: { id: saleId },
            include: { event: true },
        });
        if (!existing ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, existing.event.organizerId, role, sellerEventIds, existing.eventId)) {
            throw new api_exception_1.ApiException('SALE_NOT_FOUND', 'Sale not found.', common_1.HttpStatus.NOT_FOUND);
        }
        if (existing.status === client_1.SaleStatus.voided) {
            throw new api_exception_1.ApiException('SALE_VOIDED', 'Cannot update a voided sale.', common_1.HttpStatus.CONFLICT);
        }
        const hasPatch = dto.payment_status !== undefined ||
            dto.unit_price_cents !== undefined ||
            dto.currency !== undefined ||
            dto.notes !== undefined;
        if (!hasPatch) {
            return this.getById(organizerId, role, saleId, sellerEventIds);
        }
        await this.prisma.sale.update({
            where: { id: saleId },
            data: {
                ...(dto.payment_status !== undefined
                    ? { paymentStatus: dto.payment_status }
                    : {}),
                ...(dto.unit_price_cents !== undefined
                    ? { unitPriceCents: dto.unit_price_cents }
                    : {}),
                ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            },
        });
        return this.getById(organizerId, role, saleId, sellerEventIds);
    }
    async void(organizerId, role, saleId, sellerEventIds) {
        const existing = await this.prisma.sale.findFirst({
            where: { id: saleId },
            include: {
                event: true,
                saleCards: true,
            },
        });
        if (!existing ||
            !(0, organizer_resource_access_1.canAccessOrganizerResource)(organizerId, existing.event.organizerId, role, sellerEventIds, existing.eventId)) {
            throw new api_exception_1.ApiException('SALE_NOT_FOUND', 'Sale not found.', common_1.HttpStatus.NOT_FOUND);
        }
        if ((0, event_status_policy_1.isEventLocked)(existing.event.status)) {
            throw new api_exception_1.ApiException('EVENT_LOCKED', 'This sale cannot be voided while the event is completed or cancelled.', common_1.HttpStatus.CONFLICT);
        }
        if (existing.status === client_1.SaleStatus.voided) {
            return this.getById(organizerId, role, saleId, sellerEventIds);
        }
        const cardIds = existing.saleCards.map((sc) => sc.bingoCardId);
        await this.prisma.$transaction(async (tx) => {
            await tx.saleCard.deleteMany({ where: { saleId } });
            if (cardIds.length > 0) {
                await tx.bingoCard.updateMany({
                    where: { id: { in: cardIds } },
                    data: { status: client_1.BingoCardStatus.available },
                });
            }
            await tx.sale.update({
                where: { id: saleId },
                data: { status: client_1.SaleStatus.voided },
            });
        });
        return this.getById(organizerId, role, saleId, sellerEventIds);
    }
    async loadSaleResponse(tx, saleId) {
        const sale = await tx.sale.findFirstOrThrow({
            where: { id: saleId },
            include: {
                saleCards: { include: { bingoCard: true } },
            },
        });
        return this.toResponse(sale, sale.saleCards);
    }
    toSummary(sale) {
        return {
            id: sale.id,
            event_id: sale.eventId,
            participant_id: sale.participantId,
            quantity: sale.quantity,
            payment_status: sale.paymentStatus,
            unit_price_cents: sale.unitPriceCents,
            currency: sale.currency,
            notes: sale.notes,
            status: sale.status,
            created_at: sale.createdAt.toISOString(),
            updated_at: sale.updatedAt.toISOString(),
        };
    }
    toResponse(sale, saleCards) {
        const cards = saleCards.map((sc) => ({
            bingo_card_id: sc.bingoCard.id,
            serial_number: sc.bingoCard.serialNumber,
        }));
        return {
            id: sale.id,
            event_id: sale.eventId,
            participant_id: sale.participantId,
            quantity: sale.quantity,
            payment_status: sale.paymentStatus,
            unit_price_cents: sale.unitPriceCents,
            currency: sale.currency,
            notes: sale.notes,
            status: sale.status,
            cards,
            created_at: sale.createdAt.toISOString(),
            updated_at: sale.updatedAt.toISOString(),
        };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], SalesService);
//# sourceMappingURL=sales.service.js.map