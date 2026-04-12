import { HttpStatus, Injectable } from '@nestjs/common';
import { OrganizerRole, Winner } from '@prisma/client';
import { canAccessOrganizerResource } from '../common/access/organizer-resource-access';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import { EventsService } from '../events/events.service';
import { isEventLocked } from '../events/event-status.policy';
import type { CreateWinnerDto } from './dto/create-winner.dto';

export type WinnerResponse = {
  id: string;
  event_id: string;
  prize_id: string;
  participant_id: string;
  bingo_card_id: string | null;
  notes: string | null;
  recorded_at: string;
  revoked_at: string | null;
};

@Injectable()
export class WinnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async list(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<{ items: WinnerResponse[] }> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const rows = await this.prisma.winner.findMany({
      where: { eventId },
      orderBy: { recordedAt: 'desc' },
    });

    return { items: rows.map((w) => this.toResponse(w)) };
  }

  async create(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: CreateWinnerDto,
    sellerEventIds: string[],
  ): Promise<WinnerResponse> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const prize = await this.prisma.prize.findFirst({
      where: { id: dto.prize_id, eventId },
    });
    if (!prize) {
      throw new ApiException(
        'PRIZE_NOT_FOUND',
        'Prize not found for this event.',
        HttpStatus.NOT_FOUND,
      );
    }

    const participant = await this.prisma.participant.findFirst({
      where: { id: dto.participant_id, eventId },
    });
    if (!participant) {
      throw new ApiException(
        'PARTICIPANT_NOT_FOUND',
        'Participant not found for this event.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.bingo_card_id) {
      const card = await this.prisma.bingoCard.findFirst({
        where: { id: dto.bingo_card_id, eventId },
      });
      if (!card) {
        throw new ApiException(
          'CARD_NOT_FOUND',
          'Bingo card not found for this event.',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const activeForPrize = await this.prisma.winner.findFirst({
      where: { prizeId: dto.prize_id, revokedAt: null },
    });
    if (activeForPrize) {
      throw new ApiException(
        'PRIZE_ALREADY_HAS_WINNER',
        'An active winner already exists for this prize.',
        HttpStatus.CONFLICT,
      );
    }

    const winner = await this.prisma.winner.create({
      data: {
        eventId,
        prizeId: dto.prize_id,
        participantId: dto.participant_id,
        bingoCardId: dto.bingo_card_id ?? null,
        notes: dto.notes ?? null,
      },
    });

    return this.toResponse(winner);
  }

  async revoke(
    organizerId: string,
    role: OrganizerRole,
    winnerId: string,
    sellerEventIds: string[],
  ): Promise<WinnerResponse> {
    const winner = await this.prisma.winner.findFirst({
      where: { id: winnerId },
      include: { event: true },
    });

    if (
      !winner ||
      !canAccessOrganizerResource(
        organizerId,
        winner.event.organizerId,
        role,
        sellerEventIds,
        winner.eventId,
      )
    ) {
      throw new ApiException(
        'WINNER_NOT_FOUND',
        'Winner not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEventLocked(winner.event.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'Winners cannot be revoked while the event is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }

    if (winner.revokedAt) {
      return this.toResponse(winner);
    }

    const updated = await this.prisma.winner.update({
      where: { id: winnerId },
      data: { revokedAt: new Date() },
    });

    return this.toResponse(updated);
  }

  private toResponse(w: Winner): WinnerResponse {
    return {
      id: w.id,
      event_id: w.eventId,
      prize_id: w.prizeId,
      participant_id: w.participantId,
      bingo_card_id: w.bingoCardId,
      notes: w.notes,
      recorded_at: w.recordedAt.toISOString(),
      revoked_at: w.revokedAt ? w.revokedAt.toISOString() : null,
    };
  }
}
