import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { CreatePrizeDto } from './dto/create-prize.dto';
import type { UpdatePrizeDto } from './dto/update-prize.dto';
export type PrizeResponse = {
    id: string;
    event_id: string;
    name: string;
    description: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
};
export declare class PrizesService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    listByEvent(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<{
        items: PrizeResponse[];
    }>;
    create(organizerId: string, role: OrganizerRole, eventId: string, dto: CreatePrizeDto, sellerEventIds: string[]): Promise<PrizeResponse>;
    update(organizerId: string, role: OrganizerRole, prizeId: string, dto: UpdatePrizeDto, sellerEventIds: string[]): Promise<PrizeResponse>;
    delete(organizerId: string, role: OrganizerRole, prizeId: string, sellerEventIds: string[]): Promise<void>;
    private toResponse;
}
