import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SellerForbiddenGuard } from '../auth/seller-forbidden.guard';
import { CurrentOrganizer } from '../organizers/current-organizer.decorator';
import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';

@ApiTags('prizes')
@Controller('events/:eventId/prizes')
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class EventPrizesController {
  constructor(private readonly prizes: PrizesService) {}

  @Get()
  @ApiOperation({ summary: 'List prizes for an event' })
  async list(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.prizes.listByEvent(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create prize' })
  async create(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreatePrizeDto,
  ) {
    return this.prizes.create(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }
}
