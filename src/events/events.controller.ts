import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SellerForbiddenGuard } from "../auth/seller-forbidden.guard";
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { ListEventsQueryDto } from "./dto/list-events-query.dto";

@ApiTags("events")
@Controller("events")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @ApiOperation({ summary: "List my events (paginated)" })
  async list(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Query() query: ListEventsQueryDto,
  ) {
    return this.events.list(
      user.organizerId,
      query,
      user.role,
      user.sellerEventIds,
    );
  }

  @Post()
  @UseGuards(SellerForbiddenGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create event" })
  async create(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Body() dto: CreateEventDto,
  ) {
    return this.events.create(user.organizerId, dto);
  }

  @Get(":eventId")
  @ApiOperation({ summary: "Get event by id" })
  async getById(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
  ) {
    return this.events.getById(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }

  @Patch(":eventId")
  @UseGuards(SellerForbiddenGuard)
  @ApiOperation({ summary: "Update event (partial)" })
  async update(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.events.update(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }
}
