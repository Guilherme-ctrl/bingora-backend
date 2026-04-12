import { DrawSessionStatus, OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import type { PostCallDto } from './dto/post-call.dto';
export type DrawSessionResponse = {
    id: string;
    event_id: string;
    status: DrawSessionStatus;
    started_at: string;
    closed_at: string | null;
};
export type DrawCallResponse = {
    id: string;
    draw_session_id: string;
    sequence: number;
    ball_number: number;
    called_at: string;
    note: string | null;
};
export type DrawStateResponse = {
    session: DrawSessionResponse | null;
    calls: Array<{
        sequence: number;
        ball_number: number;
        called_at: string;
    }>;
    remaining_numbers: number[];
};
export declare class DrawService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    ensureSession(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<{
        session: DrawSessionResponse;
        created: boolean;
    }>;
    postCall(organizerId: string, role: OrganizerRole, eventId: string, dto: PostCallDto, sellerEventIds: string[]): Promise<DrawCallResponse>;
    deleteLastCall(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<void>;
    getDrawState(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<DrawStateResponse>;
    closeSession(organizerId: string, role: OrganizerRole, eventId: string, sellerEventIds: string[]): Promise<DrawSessionResponse>;
    private assertDrawableEvent;
    private requireOpenSession;
    private nextSequence;
    private fullRange;
    private toSessionResponse;
    private toCallResponse;
}
