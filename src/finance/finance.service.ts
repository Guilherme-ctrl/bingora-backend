import { Injectable } from '@nestjs/common';
import { OrganizerRole, PaymentStatus, SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';

export type CurrencyBreakdown = {
  currency: string;
  /** Vendas ativas com preço, situação paga (centavos). */
  paid_cents: number;
  /** Vendas ativas com preço, ainda não pago (centavos). */
  unpaid_cents: number;
};

export type EventFinancialSummary = {
  event_id: string;
  /** Soma de `quantity` em vendas ativas. */
  cartelas_vendidas: number;
  vendas_ativas: number;
  vendas_anuladas: number;
  /** Vendas ativas sem `unit_price_cents`. */
  vendas_sem_preco: number;
  /** Cartelas em vendas ativas sem preço registrado. */
  cartelas_em_vendas_sem_preco: number;
  /** Por moeda; `paid_cents` + `unpaid_cents` só incluem linhas com preço unitário. */
  by_currency: CurrencyBreakdown[];
};

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async getEventSummary(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<EventFinancialSummary> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const [activeSales, voidedCount] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where: { eventId, status: SaleStatus.active },
        select: {
          quantity: true,
          unitPriceCents: true,
          paymentStatus: true,
          currency: true,
        },
      }),
      this.prisma.sale.count({
        where: { eventId, status: SaleStatus.voided },
      }),
    ]);

    let cartelasVendidas = 0;
    let vendasSemPreco = 0;
    let cartelasEmVendasSemPreco = 0;

    const bucket = new Map<string, { paid: number; unpaid: number }>();

    const addCents = (currency: string, status: PaymentStatus, cents: number) => {
      const c = currency.trim().toUpperCase() || 'BRL';
      if (!bucket.has(c)) {
        bucket.set(c, { paid: 0, unpaid: 0 });
      }
      const b = bucket.get(c)!;
      if (status === PaymentStatus.paid) {
        b.paid += cents;
      } else {
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

    const by_currency: CurrencyBreakdown[] = [...bucket.entries()]
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
}
