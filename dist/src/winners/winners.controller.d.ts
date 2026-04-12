import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { WinnersService } from './winners.service';
import { RevokeWinnerDto } from './dto/revoke-winner.dto';
export declare class WinnersController {
    private readonly winners;
    constructor(winners: WinnersService);
    revoke(user: CurrentOrganizerPayload, winnerId: string, body: RevokeWinnerDto): Promise<import("./winners.service").WinnerResponse>;
}
