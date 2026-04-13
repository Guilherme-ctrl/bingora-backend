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
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { CreateRoundDto } from "./dto/create-round.dto";
import { ReconcileSellerDto } from "./dto/reconcile-seller.dto";
import { RoundsService } from "./rounds.service";

@ApiTags("rounds")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class RoundsController {
  @Get("events/:eventId/rounds/active")
  @ApiOperation({ summary: "Get current active round for event" })
  async getActiveForEvent(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
  ) {
    return this.rounds.getActiveRoundForEvent(
      user.organizerId,
      user.role,
      user.sellerEventIds,
      eventId,
    );
  }

  @Get("rounds/:roundId")
  @ApiOperation({ summary: "Get round by id" })
  async getById(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
  ) {
    return this.rounds.getRoundById(
      user.organizerId,
      user.role,
      user.sellerEventIds,
      roundId,
    );
  }

  constructor(private readonly rounds: RoundsService) {}

  @Post("events/:eventId/rounds")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create round for an event" })
  async create(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: CreateRoundDto,
  ) {
    return this.rounds.create({
      organizerId: user.organizerId,
      organizerRole: user.role,
      sellerEventIds: user.sellerEventIds,
      eventId,
      code: dto.code,
      type: dto.type,
    });
  }

  @Post("rounds/:roundId/open-sales")
  @ApiOperation({ summary: "Transition round to EM_VENDA" })
  async openSales(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
  ) {
    return this.rounds.openSales(user.organizerId, user.role, roundId);
  }

  @Post("rounds/:roundId/close-sales")
  @ApiOperation({ summary: "Transition round to AGUARDANDO_CONFERENCIA" })
  async closeSales(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
  ) {
    return this.rounds.closeSales(user.organizerId, user.role, roundId);
  }

  @Post("rounds/:roundId/start-draw")
  @ApiOperation({ summary: "Transition round to EM_SORTEIO" })
  async startDraw(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
  ) {
    return this.rounds.startDraw(user.organizerId, user.role, roundId);
  }

  @Post("rounds/:roundId/finish")
  @ApiOperation({ summary: "Finish round (FINALIZADA)" })
  async finish(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
  ) {
    return this.rounds.finish(user.organizerId, user.role, roundId);
  }

  @Get("rounds/:roundId/seller-reconciliation")
  @ApiOperation({ summary: "List reconciliation status by seller in round" })
  async listSellerReconciliation(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
  ) {
    return this.rounds.listSellerReconciliation(user.organizerId, user.role, roundId);
  }

  @Post("rounds/:roundId/seller-reconciliation/:sellerOrganizerId")
  @ApiOperation({ summary: "Set reconciliation status for seller in round" })
  async reconcileSeller(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
    @Param("sellerOrganizerId", ParseUUIDPipe) sellerOrganizerId: string,
    @Body() dto: ReconcileSellerDto,
  ) {
    return this.rounds.reconcileSeller(
      user.organizerId,
      user.role,
      roundId,
      sellerOrganizerId,
      dto.status,
      dto.justification,
    );
  }
}
