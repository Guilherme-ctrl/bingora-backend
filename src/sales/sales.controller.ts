import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { SalesService } from "./sales.service";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { VoidSaleDto } from "./dto/void-sale.dto";

@ApiTags("sales")
@Controller("sales")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Get(":saleId")
  @ApiOperation({ summary: "Get sale detail including assigned cards" })
  async getById(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("saleId", ParseUUIDPipe) saleId: string,
  ) {
    return this.sales.getById(
      user.organizerId,
      user.role,
      saleId,
      user.sellerEventIds,
    );
  }

  @Patch(":saleId")
  @ApiOperation({
    summary: "Update sale (payment fields, notes)",
    description: "Use `payment_status` to mark paid or unpaid.",
  })
  async update(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("saleId", ParseUUIDPipe) saleId: string,
    @Body() dto: UpdateSaleDto,
  ) {
    return this.sales.update(
      user.organizerId,
      user.role,
      saleId,
      dto,
      user.sellerEventIds,
    );
  }

  @Post(":saleId/void")
  @ApiOperation({
    summary: "Void sale and release cards back to available",
    description:
      "Request body `reason` is accepted for clients; not persisted in MVP.",
  })
  async voidSale(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("saleId", ParseUUIDPipe) saleId: string,
    @Body() body: VoidSaleDto,
  ) {
    void body.reason;
    return this.sales.void(
      user.organizerId,
      user.role,
      saleId,
      user.sellerEventIds,
    );
  }
}
