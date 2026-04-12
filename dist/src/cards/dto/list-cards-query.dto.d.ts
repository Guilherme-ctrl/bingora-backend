import { BingoCardStatus } from '@prisma/client';
export declare class ListCardsQueryDto {
    page: number;
    page_size: number;
    status?: BingoCardStatus;
    serial_number?: number;
}
