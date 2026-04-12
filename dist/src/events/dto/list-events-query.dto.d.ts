import { EventStatus } from '@prisma/client';
export declare class ListEventsQueryDto {
    status?: EventStatus;
    sort: 'starts_at' | 'created_at';
    order: 'asc' | 'desc';
    page: number;
    page_size: number;
}
