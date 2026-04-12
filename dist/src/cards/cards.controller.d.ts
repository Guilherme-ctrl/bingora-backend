import type { Response } from 'express';
import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { CardsService } from './cards.service';
import { GenerateCardsDto } from './dto/generate-cards.dto';
import { ListCardsQueryDto } from './dto/list-cards-query.dto';
import { ExportCardsQueryDto } from './dto/export-cards-query.dto';
export declare class CardsController {
    private readonly cards;
    constructor(cards: CardsService);
    generate(user: CurrentOrganizerPayload, eventId: string, dto: GenerateCardsDto): Promise<{
        generated_count: number;
        event_id: string;
    }>;
    export(user: CurrentOrganizerPayload, eventId: string, query: ExportCardsQueryDto, res: Response): Promise<string | import("./cards.service").CardResponse[]>;
    list(user: CurrentOrganizerPayload, eventId: string, query: ListCardsQueryDto): Promise<{
        items: import("./cards.service").CardResponse[];
        page: number;
        page_size: number;
        total: number;
    }>;
}
