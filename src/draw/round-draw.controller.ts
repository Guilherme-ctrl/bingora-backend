import {
  Body,
  Controller,
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
import { PostCallDto } from "./dto/post-call.dto";
import { InvalidateCallDto } from "./dto/invalidate-call.dto";
import { DrawService } from "./draw.service";

@ApiTags("draw")
@Controller("rounds/:roundId/draw")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoundDrawController {
  constructor(private readonly draw: DrawService) {}

  @Post("calls")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Record called ball for a round in EM_SORTEIO" })
  async postCall(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
    @Body() dto: PostCallDto,
  ) {
    return this.draw.postCallInRound(
      user.organizerId,
      user.role,
      roundId,
      dto,
      user.sellerEventIds,
    );
  }

  @Post("calls/:callId/invalidate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Invalidate a draw call with required reason" })
  async invalidateCall(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("roundId", ParseUUIDPipe) roundId: string,
    @Param("callId", ParseUUIDPipe) callId: string,
    @Body() dto: InvalidateCallDto,
  ): Promise<void> {
    await this.draw.invalidateCall(
      user.organizerId,
      user.role,
      roundId,
      callId,
      dto.reason,
      user.sellerEventIds,
    );
  }
}
