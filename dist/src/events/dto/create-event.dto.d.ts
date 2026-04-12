import { EventStatus } from '@prisma/client';
export declare class CreateEventDto {
    title: string;
    starts_at: string;
    timezone: string;
    venue_notes?: string | null;
    status?: EventStatus;
    default_unit_price_cents?: number | null;
    default_currency?: string;
}
