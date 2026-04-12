import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { CreateParticipantDto } from './dto/create-participant.dto';
import type { UpdateParticipantDto } from './dto/update-participant.dto';
import type { ListParticipantsQueryDto } from './dto/list-participants-query.dto';
export type ParticipantResponse = {
    id: string;
    event_id: string;
    display_name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};
export declare class ParticipantsService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    list(organizerId: string, role: OrganizerRole, eventId: string, query: ListParticipantsQueryDto, sellerEventIds: string[]): Promise<{
        items: ParticipantResponse[];
        page: number;
        page_size: number;
        total: number;
    }>;
    create(organizerId: string, role: OrganizerRole, eventId: string, dto: CreateParticipantDto, sellerEventIds: string[]): Promise<ParticipantResponse>;
    update(organizerId: string, role: OrganizerRole, participantId: string, dto: UpdateParticipantDto, sellerEventIds: string[]): Promise<ParticipantResponse>;
    delete(organizerId: string, role: OrganizerRole, participantId: string, sellerEventIds: string[]): Promise<void>;
    private toResponse;
}
