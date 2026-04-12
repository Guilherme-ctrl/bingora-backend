import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SellerForbiddenGuard } from "../auth/seller-forbidden.guard";
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { CardsService } from "./cards.service";
import { GenerateCardsDto } from "./dto/generate-cards.dto";
import { ListCardsQueryDto } from "./dto/list-cards-query.dto";
import { ExportCardsQueryDto } from "./dto/export-cards-query.dto";

@ApiTags("cards")
@Controller("events/:eventId/cards")
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Generate unique bingo cards for an event (once per event in MVP)",
  })
  async generate(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: GenerateCardsDto,
  ) {
    return this.cards.generate(
      user.organizerId,
      user.role,
      eventId,
      dto,
      user.sellerEventIds,
    );
  }

  @Get("export")
  @ApiOperation({
    summary: "Export all cards for printing",
    description:
      "`format=json` returns a JSON array of card objects. `format=csv` returns CSV with a grid_json column suitable for tooling/PDF pipelines.",
  })
  @ApiProduces("application/json", "text/csv")
  async export(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Query() query: ExportCardsQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const format = query.format ?? "json";

    if (format === "csv") {
      const csv = await this.cards.exportCsv(
        user.organizerId,
        user.role,
        eventId,
        user.sellerEventIds,
      );
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="bingo-cards-${eventId}.csv"`,
      );
      return csv;
    }

    const data = await this.cards.exportJson(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="bingo-cards-${eventId}.json"`,
    );
    return data;
  }

  @Get()
  @Header("Cache-Control", "no-store")
  @ApiOperation({
    summary:
      "List cards (paginated). Use status=available to list only unsold cards.",
  })
  async list(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Query() query: ListCardsQueryDto,
  ) {
    return this.cards.list(
      user.organizerId,
      user.role,
      eventId,
      query,
      user.sellerEventIds,
    );
  }
}
