import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { CardsService } from '../cards/cards.service';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ListSalesQueryDto } from './dto/list-sales-query.dto';
export declare class EventSalesController {
    private readonly sales;
    private readonly cards;
    constructor(sales: SalesService, cards: CardsService);
    availableSerials(user: CurrentOrganizerPayload, eventId: string): Promise<{
        serial_numbers: number[];
    }>;
    list(user: CurrentOrganizerPayload, eventId: string, query: ListSalesQueryDto): Promise<{
        items: import("./sales.service").SaleSummary[];
        page: number;
        page_size: number;
        total: number;
    }>;
    create(user: CurrentOrganizerPayload, eventId: string, dto: CreateSaleDto): Promise<import("./sales.service").SaleResponse>;
}
