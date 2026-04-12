import {
  Body,
  Controller,
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
import { RevokeWinnerDto } from "./dto/revoke-winner.dto";

@ApiTags("winners")
@Controller("winners")
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class WinnersController {
  constructor(private readonly winners: WinnersService) {}

  @Post(":winnerId/revoke")
  @ApiOperation({
    summary: "Revoke a winner",
    description: "Body `reason` is accepted; not persisted in MVP.",
  })
  async revoke(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("winnerId", ParseUUIDPipe) winnerId: string,
    @Body() body: RevokeWinnerDto,
  ) {
    void body.reason;
    return this.winners.revoke(
      user.organizerId,
      user.role,
      winnerId,
      user.sellerEventIds,
    );
  }
}
