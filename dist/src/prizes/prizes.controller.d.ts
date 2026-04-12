import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { PrizesService } from './prizes.service';
import { UpdatePrizeDto } from './dto/update-prize.dto';
export declare class PrizesController {
    private readonly prizes;
    constructor(prizes: PrizesService);
    update(user: CurrentOrganizerPayload, prizeId: string, dto: UpdatePrizeDto): Promise<import("./prizes.service").PrizeResponse>;
    delete(user: CurrentOrganizerPayload, prizeId: string): Promise<void>;
}
