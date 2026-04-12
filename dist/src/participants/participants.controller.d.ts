import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { ParticipantsService } from './participants.service';
import { UpdateParticipantDto } from './dto/update-participant.dto';
export declare class ParticipantsController {
    private readonly participants;
    constructor(participants: ParticipantsService);
    update(user: CurrentOrganizerPayload, participantId: string, dto: UpdateParticipantDto): Promise<import("./participants.service").ParticipantResponse>;
    delete(user: CurrentOrganizerPayload, participantId: string): Promise<void>;
}
