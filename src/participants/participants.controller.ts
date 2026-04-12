import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentOrganizer } from "../organizers/current-organizer.decorator";
import type { CurrentOrganizerPayload } from "../organizers/current-organizer.decorator";
import { ParticipantsService } from "./participants.service";
import { UpdateParticipantDto } from "./dto/update-participant.dto";

@ApiTags("participants")
@Controller("participants")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParticipantsController {
  constructor(private readonly participants: ParticipantsService) {}

  @Patch(":participantId")
  @ApiOperation({ summary: "Update participant" })
  async update(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("participantId", ParseUUIDPipe) participantId: string,
    @Body() dto: UpdateParticipantDto,
  ) {
    return this.participants.update(
      user.organizerId,
      user.role,
      participantId,
      dto,
      user.sellerEventIds,
    );
  }

  @Delete(":participantId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete participant" })
  async delete(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param("participantId", ParseUUIDPipe) participantId: string,
  ): Promise<void> {
    await this.participants.delete(
      user.organizerId,
      user.role,
      participantId,
      user.sellerEventIds,
    );
  }
}
