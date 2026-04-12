import { PaymentStatus, SaleStatus } from '@prisma/client';
export declare class ListSalesQueryDto {
    page: number;
    page_size: number;
    payment_status?: PaymentStatus;
    status?: SaleStatus;
}
