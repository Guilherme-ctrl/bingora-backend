import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SellerForbiddenGuard } from '../auth/seller-forbidden.guard';
import { CurrentOrganizer } from '../organizers/current-organizer.decorator';
import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { DrawService } from './draw.service';
import { PostCallDto } from './dto/post-call.dto';

@ApiTags('draw')
@Controller('events/:eventId/draw')
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class DrawController {
  constructor(private readonly draw: DrawService) {}

  @Post('session')
  @ApiOperation({
    summary: 'Create draw session if missing (idempotent when open)',
  })
  async startSession(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { session, created } = await this.draw.ensureSession(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return session;
  }

  @Post('calls')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a called ball (1–75), unique per session' })
  async postCall(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: PostCallDto,
  ) {
    return this.draw.postCall(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }

  @Delete('calls/last')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove the last call (open session only)' })
  async deleteLast(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<void> {
    await this.draw.deleteLastCall(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Draw session, calls in order, and remaining numbers 1–75',
  })
  async getState(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.draw.getDrawState(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }

  @Post('close')
  @ApiOperation({ summary: 'Close the draw session' })
  async close(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.draw.closeSession(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }
}
