import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { CreateWinnerDto } from './dto/create-winner.dto';
export type WinnerResponse = {
    id: string;
    event_id: string;
    prize_id: string;
    participant_id: string;
    bingo_card_id: string | null;
    notes: string | null;
    recorded_at: string;
    revoked_at: string | null;
};
export declare class WinnersService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    list(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<{
        items: WinnerResponse[];
    }>;
    create(organizerId: string, role: OrganizerRole, eventId: string, dto: CreateWinnerDto, sellerEventIds: string[]): Promise<WinnerResponse>;
    revoke(organizerId: string, role: OrganizerRole, winnerId: string, sellerEventIds: string[]): Promise<WinnerResponse>;
    private toResponse;
}
