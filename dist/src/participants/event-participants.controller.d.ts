import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ListParticipantsQueryDto } from './dto/list-participants-query.dto';
export declare class EventParticipantsController {
    private readonly participants;
    constructor(participants: ParticipantsService);
    list(user: CurrentOrganizerPayload, eventId: string, query: ListParticipantsQueryDto): Promise<{
        items: import("./participants.service").ParticipantResponse[];
        page: number;
        page_size: number;
        total: number;
    }>;
    create(user: CurrentOrganizerPayload, eventId: string, dto: CreateParticipantDto): Promise<import("./participants.service").ParticipantResponse>;
}
