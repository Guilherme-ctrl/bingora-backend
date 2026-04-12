import { ApiProperty } from '@nestjs/swagger';
import { OrganizerRole } from '@prisma/client';

export class OrganizerPublicDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: OrganizerRole, enumName: 'OrganizerRole' })
  role!: OrganizerRole;

  @ApiProperty()
  created_at!: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({ type: OrganizerPublicDto })
  organizer!: OrganizerPublicDto;

  @ApiProperty()
  access_token!: string;

  @ApiProperty({ example: 'Bearer' })
  token_type!: string;

  @ApiProperty({ example: 3600 })
  expires_in!: number;
}
