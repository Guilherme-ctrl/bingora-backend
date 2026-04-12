import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { SalesService } from './sales.service';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { VoidSaleDto } from './dto/void-sale.dto';
export declare class SalesController {
    private readonly sales;
    constructor(sales: SalesService);
    getById(user: CurrentOrganizerPayload, saleId: string): Promise<import("./sales.service").SaleResponse>;
    update(user: CurrentOrganizerPayload, saleId: string, dto: UpdateSaleDto): Promise<import("./sales.service").SaleResponse>;
    voidSale(user: CurrentOrganizerPayload, saleId: string, body: VoidSaleDto): Promise<import("./sales.service").SaleResponse>;
}
