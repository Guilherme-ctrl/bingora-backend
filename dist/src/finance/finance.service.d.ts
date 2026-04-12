import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
export type CurrencyBreakdown = {
    currency: string;
    paid_cents: number;
    unpaid_cents: number;
};
export type EventFinancialSummary = {
    event_id: string;
    cartelas_vendidas: number;
    vendas_ativas: number;
    vendas_anuladas: number;
    vendas_sem_preco: number;
    cartelas_em_vendas_sem_preco: number;
    by_currency: CurrencyBreakdown[];
};
export declare class FinanceService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    getEventSummary(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<EventFinancialSummary>;
}
