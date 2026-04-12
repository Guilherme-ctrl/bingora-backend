import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SellerForbiddenGuard } from "../auth/seller-forbidden.guard";
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { FinanceService } from "./finance.service";

@ApiTags("finance")
@Controller("events/:eventId/finance")
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class EventFinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get("summary")
  @ApiOperation({
    summary: "Resumo financeiro do evento (vendas ativas, valores por moeda)",
  })
  async summary(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
  ) {
    return this.finance.getEventSummary(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }
}
