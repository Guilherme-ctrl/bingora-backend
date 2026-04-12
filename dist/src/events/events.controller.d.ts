import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
export declare class EventsController {
    private readonly events;
    constructor(events: EventsService);
    list(user: CurrentOrganizerPayload, query: ListEventsQueryDto): Promise<{
        items: import("./events.service").EventResponse[];
        page: number;
        page_size: number;
        total: number;
    }>;
    create(user: CurrentOrganizerPayload, dto: CreateEventDto): Promise<import("./events.service").EventResponse>;
    getById(user: CurrentOrganizerPayload, eventId: string): Promise<import("./events.service").EventResponse>;
    update(user: CurrentOrganizerPayload, eventId: string, dto: UpdateEventDto): Promise<import("./events.service").EventResponse>;
}
