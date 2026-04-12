import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { EventsService } from './events.service';
export declare class EventLogoController {
    private readonly events;
    constructor(events: EventsService);
    uploadLogo(user: CurrentOrganizerPayload, eventId: string, file: Express.Multer.File | undefined): Promise<import("./events.service").EventResponse>;
    deleteLogo(user: CurrentOrganizerPayload, eventId: string): Promise<import("./events.service").EventResponse>;
}
