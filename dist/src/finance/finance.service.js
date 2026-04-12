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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const events_service_1 = require("../events/events.service");
let FinanceService = class FinanceService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async getEventSummary(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const [activeSales, voidedCount] = await this.prisma.$transaction([
            this.prisma.sale.findMany({
                where: { eventId, status: client_1.SaleStatus.active },
                select: {
                    quantity: true,
                    unitPriceCents: true,
                    paymentStatus: true,
                    currency: true,
                },
            }),
            this.prisma.sale.count({
                where: { eventId, status: client_1.SaleStatus.voided },
            }),
        ]);
        let cartelasVendidas = 0;
        let vendasSemPreco = 0;
        let cartelasEmVendasSemPreco = 0;
        const bucket = new Map();
        const addCents = (currency, status, cents) => {
            const c = currency.trim().toUpperCase() || 'BRL';
            if (!bucket.has(c)) {
                bucket.set(c, { paid: 0, unpaid: 0 });
            }
            const b = bucket.get(c);
            if (status === client_1.PaymentStatus.paid) {
                b.paid += cents;
            }
            else {
                b.unpaid += cents;
            }
        };
        for (const s of activeSales) {
            cartelasVendidas += s.quantity;
            if (s.unitPriceCents == null) {
                vendasSemPreco += 1;
                cartelasEmVendasSemPreco += s.quantity;
                continue;
            }
            const lineTotal = s.unitPriceCents * s.quantity;
            addCents(s.currency, s.paymentStatus, lineTotal);
        }
        const by_currency = [...bucket.entries()]
            .map(([currency, v]) => ({
            currency,
            paid_cents: v.paid,
            unpaid_cents: v.unpaid,
        }))
            .sort((a, b) => a.currency.localeCompare(b.currency));
        return {
            event_id: eventId,
            cartelas_vendidas: cartelasVendidas,
            vendas_ativas: activeSales.length,
            vendas_anuladas: voidedCount,
            vendas_sem_preco: vendasSemPreco,
            cartelas_em_vendas_sem_preco: cartelasEmVendasSemPreco,
            by_currency,
        };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map