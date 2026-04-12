import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { ParticipantsService } from "./participants.service";
import { CreateParticipantDto } from "./dto/create-participant.dto";
import { ListParticipantsQueryDto } from "./dto/list-participants-query.dto";

@ApiTags("participants")
@Controller("events/:eventId/participants")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventParticipantsController {
  constructor(private readonly participants: ParticipantsService) {}

  @Get()
  @ApiOperation({ summary: "List participants for an event (paginated)" })
  async list(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Query() query: ListParticipantsQueryDto,
  ) {
    return this.participants.list(
      user.organizerId,
      user.role,
      eventId,
      query,
      user.sellerEventIds,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create participant" })
  async create(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: CreateParticipantDto,
  ) {
    return this.participants.create(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }
}
