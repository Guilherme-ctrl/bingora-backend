import { PaymentStatus } from '@prisma/client';
export declare class UpdateSaleDto {
    payment_status?: PaymentStatus;
    unit_price_cents?: number | null;
    currency?: string;
    notes?: string | null;
}
