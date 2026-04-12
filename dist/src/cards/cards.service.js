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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const events_service_1 = require("../events/events.service");
const bingo_grid_1 = require("./bingo-grid");
const MAX_GENERATION_ATTEMPTS_PER_CARD = 500;
let CardsService = class CardsService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async generate(organizerId, role, eventId, dto, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        await this.prisma.$transaction(async (tx) => {
            const existing = await tx.bingoCard.count({ where: { eventId } });
            if (existing > 0) {
                throw new api_exception_1.ApiException('CARDS_ALREADY_EXIST', 'Cards already exist for this event. Regeneration is blocked in MVP.', common_1.HttpStatus.CONFLICT);
            }
            const usedFingerprints = new Set();
            const batch = [];
            for (let serial = 1; serial <= dto.count; serial++) {
                let fingerprint = '';
                let grid = null;
                for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS_PER_CARD; attempt++) {
                    const g = (0, bingo_grid_1.generateRandomGrid)();
                    const fp = (0, bingo_grid_1.fingerprintGrid)(g);
                    if (!usedFingerprints.has(fp)) {
                        grid = g;
                        fingerprint = fp;
                        usedFingerprints.add(fp);
                        break;
                    }
                }
                if (!grid) {
                    throw new api_exception_1.ApiException('CARD_GENERATION_FAILED', 'Could not generate a unique card grid after multiple attempts.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                batch.push({
                    eventId,
                    serialNumber: serial,
                    grid: grid,
                    gridFingerprint: fingerprint,
                    status: client_1.BingoCardStatus.available,
                });
            }
            await tx.bingoCard.createMany({ data: batch });
        });
        return { generated_count: dto.count, event_id: eventId };
    }
    async list(organizerId, role, eventId, query, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const page = query.page ?? 1;
        const page_size = query.page_size ?? 25;
        const where = { eventId };
        if (query.status !== undefined) {
            where.status = query.status;
        }
        if (query.serial_number !== undefined) {
            where.serialNumber = query.serial_number;
        }
        const skip = (page - 1) * page_size;
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.bingoCard.findMany({
                where,
                orderBy: [{ serialNumber: 'asc' }],
                skip,
                take: page_size,
            }),
            this.prisma.bingoCard.count({ where }),
        ]);
        return {
            items: rows.map((c) => this.toResponse(c)),
            page,
            page_size,
            total,
        };
    }
    async exportJson(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const rows = await this.prisma.bingoCard.findMany({
            where: { eventId },
            orderBy: { serialNumber: 'asc' },
        });
        return rows.map((c) => this.toResponse(c));
    }
    async listAvailableSerialNumbers(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const rows = await this.prisma.bingoCard.findMany({
            where: { eventId, status: client_1.BingoCardStatus.available },
            select: { serialNumber: true },
            orderBy: { serialNumber: 'asc' },
        });
        return { serial_numbers: rows.map((r) => r.serialNumber) };
    }
    async exportCsv(organizerId, role, eventId, sellerEventIds) {
        const cards = await this.exportJson(organizerId, role, eventId, sellerEventIds);
        const lines = ['id,event_id,serial_number,status,grid_json'];
        for (const c of cards) {
            const gridJson = JSON.stringify(c.grid).replaceAll('"', '""');
            lines.push(`${c.id},${c.event_id},${c.serial_number},${c.status},"${gridJson}"`);
        }
        return lines.join('\n');
    }
    toResponse(card) {
        return {
            id: card.id,
            event_id: card.eventId,
            serial_number: card.serialNumber,
            status: card.status,
            grid: card.grid,
            created_at: card.createdAt.toISOString(),
        };
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], CardsService);
//# sourceMappingURL=cards.service.js.map