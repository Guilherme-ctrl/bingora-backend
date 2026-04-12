import type { Response } from 'express';
import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { DrawService } from './draw.service';
import { PostCallDto } from './dto/post-call.dto';
export declare class DrawController {
    private readonly draw;
    constructor(draw: DrawService);
    startSession(user: CurrentOrganizerPayload, eventId: string, res: Response): Promise<import("./draw.service").DrawSessionResponse>;
    postCall(user: CurrentOrganizerPayload, eventId: string, dto: PostCallDto): Promise<import("./draw.service").DrawCallResponse>;
    deleteLast(user: CurrentOrganizerPayload, eventId: string): Promise<void>;
    getState(user: CurrentOrganizerPayload, eventId: string): Promise<import("./draw.service").DrawStateResponse>;
    close(user: CurrentOrganizerPayload, eventId: string): Promise<import("./draw.service").DrawSessionResponse>;
}
