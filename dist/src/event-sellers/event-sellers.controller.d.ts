import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { EventSellersService } from './event-sellers.service';
import { AddEventSellerDto } from './dto/add-event-seller.dto';
export declare class EventSellersController {
    private readonly eventSellers;
    constructor(eventSellers: EventSellersService);
    list(user: CurrentOrganizerPayload, eventId: string): Promise<{
        items: import("./event-sellers.service").EventSellerRow[];
    }>;
    add(user: CurrentOrganizerPayload, eventId: string, dto: AddEventSellerDto): Promise<import("./event-sellers.service").EventSellerRow>;
    remove(user: CurrentOrganizerPayload, eventId: string, sellerOrganizerId: string): Promise<void>;
}
