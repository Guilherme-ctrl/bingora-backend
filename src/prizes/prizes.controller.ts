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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SellerForbiddenGuard } from '../auth/seller-forbidden.guard';
import { CurrentOrganizer } from '../organizers/current-organizer.decorator';
import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { PrizesService } from './prizes.service';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@ApiTags('prizes')
@Controller('prizes')
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class PrizesController {
  constructor(private readonly prizes: PrizesService) {}

  @Patch(':prizeId')
  @ApiOperation({ summary: 'Update prize' })
  async update(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('prizeId', ParseUUIDPipe) prizeId: string,
    @Body() dto: UpdatePrizeDto,
  ) {
    return this.prizes.update(
      user.organizerId,
      user.role,
      prizeId,
      dto,
      user.sellerEventIds,
    );
  }

  @Delete(':prizeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete prize' })
  async delete(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('prizeId', ParseUUIDPipe) prizeId: string,
  ): Promise<void> {
    await this.prizes.delete(
      user.organizerId,
      user.role,
      prizeId,
      user.sellerEventIds,
    );
  }
}
