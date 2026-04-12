import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { writeFileSync, mkdirSync } from 'node:fs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SellerForbiddenGuard } from '../auth/seller-forbidden.guard';
import { ApiException } from '../common/exceptions/api.exception';
import { CurrentOrganizer } from '../organizers/current-organizer.decorator';
import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { EventsService } from './events.service';
import {
  EVENT_LOGO_MAX_BYTES,
  extForImageMime,
  publicEventLogoPath,
  safeUnlinkUpload,
  eventLogosAbsoluteDir,
} from './event-logo.constants';
import { isEventLocked } from './event-status.policy';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard, SellerForbiddenGuard)
@ApiBearerAuth()
export class EventLogoController {
  constructor(private readonly events: EventsService) {}

  @Post(':eventId/logo')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Enviar logo do evento (PNG, JPEG, WebP ou GIF; máx. 2 MB)',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: EVENT_LOGO_MAX_BYTES },
    }),
  )
  async uploadLogo(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file?.buffer?.length) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'Envie um arquivo de imagem.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const ext = extForImageMime(file.mimetype);
    if (!ext) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'Formato não suportado. Use PNG, JPEG, WebP ou GIF.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.events.findEventForAccess(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
    if (isEventLocked(existing.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'This event is completed or cancelled and cannot be modified.',
        HttpStatus.CONFLICT,
      );
    }

    const newPublicPath = publicEventLogoPath(eventId, ext);
    const dir = eventLogosAbsoluteDir();
    mkdirSync(dir, { recursive: true });
    const destAbs = `${dir}/${eventId}${ext}`;

    safeUnlinkUpload(existing.logoUrl);

    try {
      writeFileSync(destAbs, file.buffer);
    } catch {
      throw new ApiException(
        'LOGO_WRITE_FAILED',
        'Não foi possível salvar o arquivo.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      return await this.events.persistLogoUrl(
        user.organizerId,
        user.role,
        eventId,
        user.sellerEventIds,
        newPublicPath,
      );
    } catch (err) {
      safeUnlinkUpload(newPublicPath);
      throw err;
    }
  }

  @Delete(':eventId/logo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover logo do evento' })
  async deleteLogo(
    @CurrentOrganizer() user: CurrentOrganizerPayload,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    const existing = await this.events.findEventForAccess(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
    );
    if (isEventLocked(existing.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'This event is completed or cancelled and cannot be modified.',
        HttpStatus.CONFLICT,
      );
    }
    safeUnlinkUpload(existing.logoUrl);
    return this.events.persistLogoUrl(
      user.organizerId,
      user.role,
      eventId,
      user.sellerEventIds,
      null,
    );
  }
}
