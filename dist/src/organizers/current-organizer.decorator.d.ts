import type { OrganizerRole } from '@prisma/client';
export type CurrentOrganizerPayload = {
    organizerId: string;
    email: string;
    role: OrganizerRole;
    sellerEventIds: string[];
};
export declare const CurrentOrganizer: (...dataOrPipes: unknown[]) => ParameterDecorator;
