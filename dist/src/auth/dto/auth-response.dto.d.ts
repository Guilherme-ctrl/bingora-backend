import { OrganizerRole } from '@prisma/client';
export declare class OrganizerPublicDto {
    id: string;
    email: string;
    role: OrganizerRole;
    created_at: string;
}
export declare class AuthTokensResponseDto {
    organizer: OrganizerPublicDto;
    access_token: string;
    token_type: string;
    expires_in: number;
}
