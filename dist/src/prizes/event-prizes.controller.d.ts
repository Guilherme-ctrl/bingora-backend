import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
export declare class EventPrizesController {
    private readonly prizes;
    constructor(prizes: PrizesService);
    list(user: CurrentOrganizerPayload, eventId: string): Promise<{
        items: import("./prizes.service").PrizeResponse[];
    }>;
    create(user: CurrentOrganizerPayload, eventId: string, dto: CreatePrizeDto): Promise<import("./prizes.service").PrizeResponse>;
}
