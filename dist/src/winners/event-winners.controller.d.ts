import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { WinnersService } from './winners.service';
import { CreateWinnerDto } from './dto/create-winner.dto';
export declare class EventWinnersController {
    private readonly winners;
    constructor(winners: WinnersService);
    list(user: CurrentOrganizerPayload, eventId: string): Promise<{
        items: import("./winners.service").WinnerResponse[];
    }>;
    create(user: CurrentOrganizerPayload, eventId: string, dto: CreateWinnerDto): Promise<import("./winners.service").WinnerResponse>;
}
