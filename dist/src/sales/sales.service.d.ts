import { OrganizerRole, PaymentStatus, SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { CreateSaleDto } from './dto/create-sale.dto';
import type { UpdateSaleDto } from './dto/update-sale.dto';
import type { ListSalesQueryDto } from './dto/list-sales-query.dto';
export type SaleCardSummary = {
    bingo_card_id: string;
    serial_number: number;
};
export type SaleResponse = {
    id: string;
    event_id: string;
    participant_id: string;
    quantity: number;
    payment_status: PaymentStatus;
    unit_price_cents: number | null;
    currency: string;
    notes: string | null;
    status: SaleStatus;
    cards: SaleCardSummary[];
    created_at: string;
    updated_at: string;
};
export type SaleSummary = {
    id: string;
    event_id: string;
    participant_id: string;
    quantity: number;
    payment_status: PaymentStatus;
    unit_price_cents: number | null;
    currency: string;
    notes: string | null;
    status: SaleStatus;
    created_at: string;
    updated_at: string;
};
export declare class SalesService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    create(organizerId: string, role: OrganizerRole, eventId: string, dto: CreateSaleDto, sellerEventIds: string[]): Promise<SaleResponse>;
    listByEvent(organizerId: string, role: OrganizerRole, eventId: string, query: ListSalesQueryDto, sellerEventIds: string[]): Promise<{
        items: SaleSummary[];
        page: number;
        page_size: number;
        total: number;
    }>;
    getById(organizerId: string, role: OrganizerRole, saleId: string, sellerEventIds: string[]): Promise<SaleResponse>;
    update(organizerId: string, role: OrganizerRole, saleId: string, dto: UpdateSaleDto, sellerEventIds: string[]): Promise<SaleResponse>;
    void(organizerId: string, role: OrganizerRole, saleId: string, sellerEventIds: string[]): Promise<SaleResponse>;
    private loadSaleResponse;
    private toSummary;
    private toResponse;
}
