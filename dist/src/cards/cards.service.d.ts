import { BingoCardStatus, OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { BingoGridPayload } from './bingo-grid';
import type { GenerateCardsDto } from './dto/generate-cards.dto';
import type { ListCardsQueryDto } from './dto/list-cards-query.dto';
export type CardResponse = {
    id: string;
    event_id: string;
    serial_number: number;
    status: BingoCardStatus;
    grid: BingoGridPayload;
    created_at: string;
};
export declare class CardsService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    generate(organizerId: string, role: OrganizerRole, eventId: string, dto: GenerateCardsDto, sellerEventIds: string[]): Promise<{
        generated_count: number;
        event_id: string;
    }>;
    list(organizerId: string, role: OrganizerRole, eventId: string, query: ListCardsQueryDto, sellerEventIds: string[]): Promise<{
        items: CardResponse[];
        page: number;
        page_size: number;
        total: number;
    }>;
    exportJson(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<CardResponse[]>;
    listAvailableSerialNumbers(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<{
        serial_numbers: number[];
    }>;
    exportCsv(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<string>;
    private toResponse;
}
