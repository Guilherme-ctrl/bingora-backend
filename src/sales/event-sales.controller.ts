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
import { CardsService } from "../cards/cards.service";
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { ListSalesQueryDto } from "./dto/list-sales-query.dto";

@ApiTags("sales")
@Controller("events/:eventId/sales")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventSalesController {
  constructor(
    private readonly sales: SalesService,
    private readonly cards: CardsService,
  ) {}

  @Get("available-serials")
  @ApiOperation({
    summary:
      "Números de série das cartelas ainda disponíveis (para escolher na venda)",
  })
  async availableSerials(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
  ) {
    return this.cards.listAvailableSerialNumbers(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
  }

  @Get()
  @ApiOperation({
    summary:
      "List sales for an event (paginated; card lines omitted — use GET /sales/:id)",
  })
  async list(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Query() query: ListSalesQueryDto,
  ) {
    return this.sales.listByEvent(
      user.organizerId,
      user.role,
      eventId,
      query,
      user.sellerEventIds,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      "Create sale and assign bingo cards (optional serial_numbers to pick specific cards)",
  })
  async create(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.sales.create(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }
}
