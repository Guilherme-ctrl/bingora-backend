import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { AddEventSellerDto } from './dto/add-event-seller.dto';
export type EventSellerRow = {
    seller_organizer_id: string;
    email: string;
    created_at: string;
};
export declare class EventSellersService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    private normalizeEmail;
    listForEvent(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<{
        items: EventSellerRow[];
    }>;
    addToEvent(organizerId: string, role: OrganizerRole, eventId: string, dto: AddEventSellerDto, sellerEventIds: string[]): Promise<EventSellerRow>;
    removeFromEvent(organizerId: string, role: OrganizerRole, eventId: string, sellerOrganizerId: string, sellerEventIds: string[]): Promise<void>;
}
