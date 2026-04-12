import { PaymentStatus } from '@prisma/client';
export declare class CreateSaleDto {
    participant_id: string;
    quantity: number;
    payment_status: PaymentStatus;
    unit_price_cents?: number | null;
    currency?: string;
    notes?: string | null;
    serial_numbers?: number[];
}
