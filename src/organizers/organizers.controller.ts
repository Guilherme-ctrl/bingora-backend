import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizersService } from './organizers.service';
import type { OrganizerProfileDto } from './organizers.service';
import { CurrentOrganizer } from './current-organizer.decorator';

@ApiTags('organizers')
@Controller()
export class OrganizersController {
  constructor(private readonly organizers: OrganizersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current organizer profile' })
  async me(
    @CurrentOrganizer() user: { organizerId: string },
  ): Promise<OrganizerProfileDto> {
    return this.organizers.getProfile(user.organizerId);
  }
}
