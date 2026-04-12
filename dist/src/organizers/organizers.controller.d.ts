import { OrganizersService } from './organizers.service';
import type { OrganizerProfileDto } from './organizers.service';
export declare class OrganizersController {
    private readonly organizers;
    constructor(organizers: OrganizersService);
    me(user: {
        organizerId: string;
    }): Promise<OrganizerProfileDto>;
}
