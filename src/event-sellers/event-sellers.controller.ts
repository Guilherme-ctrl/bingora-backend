import {
  Body,
  Controller,
  Delete,
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
import { EventSellersService } from "./event-sellers.service";
import { AddEventSellerDto } from "./dto/add-event-seller.dto";

@ApiTags("event-sellers")
@Controller("events/:eventId/sellers")
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class EventSellersController {
  constructor(private readonly eventSellers: EventSellersService) {}

  @Get()
  @ApiOperation({
    summary: "List sellers assigned to this event (event owner / admin)",
  })
  async list(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
  ) {
    return this.eventSellers.listForEvent(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Add a seller to this event (creates seller account if needed)",
  })
  async add(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: AddEventSellerDto,
  ) {
    return this.eventSellers.addToEvent(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }

  @Delete(":sellerOrganizerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove seller assignment from this event" })
  async remove(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Param("sellerOrganizerId", ParseUUIDPipe) sellerOrganizerId: string,
  ): Promise<void> {
    await this.eventSellers.removeFromEvent(
      user.organizerId,
      user.role,
      eventId,
      sellerOrganizerId,
      user.sellerEventIds,
    );
  }
}
