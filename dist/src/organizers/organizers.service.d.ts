import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type OrganizerProfileDto = {
    id: string;
    email: string;
    role: OrganizerRole;
    created_at: string;
    seller_event_ids?: string[];
};
export declare class OrganizersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(organizerId: string): Promise<OrganizerProfileDto>;
}
