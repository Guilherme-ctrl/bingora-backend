import { EventStatus, OrganizerRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEventDto } from './dto/create-event.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { ListEventsQueryDto } from './dto/list-events-query.dto';
declare const organizerEmailInclude: {
    readonly organizer: {
        readonly select: {
            readonly email: true;
        };
    };
};
export type EventWithOrganizerEmail = Prisma.EventGetPayload<{
    include: typeof organizerEmailInclude;
}>;
export type EventResponse = {
    id: string;
    organizer_id: string;
    organizer_email: string;
    title: string;
    starts_at: string;
    timezone: string;
    venue_notes: string | null;
    default_unit_price_cents: number | null;
    default_currency: string;
    logo_url: string | null;
    status: EventStatus;
    created_at: string;
    updated_at: string;
};
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(organizerId: string, query: ListEventsQueryDto, role: OrganizerRole, sellerEventIds: string[]): Promise<{
        items: EventResponse[];
        page: number;
        page_size: number;
        total: number;
    }>;
    create(organizerId: string, dto: CreateEventDto): Promise<EventResponse>;
    getById(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<EventResponse>;
    update(organizerId: string, role: OrganizerRole, eventId: string, dto: UpdateEventDto, sellerEventIds: string[]): Promise<EventResponse>;
    persistLogoUrl(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[], logoUrl: string | null): Promise<EventResponse>;
    findEventForAccess(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<EventWithOrganizerEmail>;
    findOwnedOrThrow(organizerId: string, eventId: string): Promise<EventWithOrganizerEmail>;
    private updateDtoHasKeys;
    private toResponse;
}
export {};
