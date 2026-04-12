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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SellerForbiddenGuard } from "../auth/seller-forbidden.guard";
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { WinnersService } from "./winners.service";
import { CreateWinnerDto } from "./dto/create-winner.dto";

@ApiTags("winners")
@Controller("events/:eventId/winners")
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class EventWinnersController {
  constructor(private readonly winners: WinnersService) {}

  @Get()
  @ApiOperation({ summary: "List winners for an event" })
  async list(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
  ) {
    return this.winners.list(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Record a winner manually" })
  async create(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: CreateWinnerDto,
  ) {
    return this.winners.create(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }
}
