import { HttpStatus, Injectable } from '@nestjs/common';
import { OrganizerRole, Prize } from '@prisma/client';
import { canAccessOrganizerResource } from '../common/access/organizer-resource-access';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import { EventsService } from '../events/events.service';
import { isEventLocked } from '../events/event-status.policy';
import type { CreatePrizeDto } from './dto/create-prize.dto';
import type { UpdatePrizeDto } from './dto/update-prize.dto';

export type PrizeResponse = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class PrizesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async listByEvent(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<{ items: PrizeResponse[] }> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const prizes = await this.prisma.prize.findMany({
      where: { eventId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return { items: prizes.map((p) => this.toResponse(p)) };
  }

  async create(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: CreatePrizeDto,
    sellerEventIds: string[],
  ): Promise<PrizeResponse> {
    const event = await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    if (isEventLocked(event.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'Prizes cannot be modified while the event is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }

    const prize = await this.prisma.prize.create({
      data: {
        eventId,
        name: dto.name,
        description: dto.description ?? null,
        sortOrder: dto.sort_order ?? 0,
      },
    });

    return this.toResponse(prize);
  }

  async update(
    organizerId: string,
    role: OrganizerRole,
    prizeId: string,
    dto: UpdatePrizeDto,
    sellerEventIds: string[],
  ): Promise<PrizeResponse> {
    const prize = await this.prisma.prize.findFirst({
      where: { id: prizeId },
      include: { event: true },
    });

    if (
      !prize ||
      !canAccessOrganizerResource(
        organizerId,
        prize.event.organizerId,
        role,
        sellerEventIds,
        prize.eventId,
      )
    ) {
      throw new ApiException(
        'PRIZE_NOT_FOUND',
        'Prize not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEventLocked(prize.event.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'Prizes cannot be modified while the event is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }

    const hasPatch =
      dto.name !== undefined ||
      dto.description !== undefined ||
      dto.sort_order !== undefined;

    if (!hasPatch) {
      return this.toResponse(prize);
    }

    const updated = await this.prisma.prize.update({
      where: { id: prizeId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.sort_order !== undefined ? { sortOrder: dto.sort_order } : {}),
      },
    });

    return this.toResponse(updated);
  }

  async delete(
    organizerId: string,
    role: OrganizerRole,
    prizeId: string,
    sellerEventIds: string[],
  ): Promise<void> {
    const prize = await this.prisma.prize.findFirst({
      where: { id: prizeId },
      include: { event: true },
    });

    if (
      !prize ||
      !canAccessOrganizerResource(
        organizerId,
        prize.event.organizerId,
        role,
        sellerEventIds,
        prize.eventId,
      )
    ) {
      throw new ApiException(
        'PRIZE_NOT_FOUND',
        'Prize not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEventLocked(prize.event.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'Prizes cannot be modified while the event is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }

    // FK restricts delete while any Winner row references this prize (including revoked).
    const winnerRow = await this.prisma.winner.findFirst({
      where: { prizeId },
    });
    if (winnerRow) {
      throw new ApiException(
        'PRIZE_HAS_WINNER',
        'Cannot delete a prize that is linked to winner records.',
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.prize.delete({ where: { id: prizeId } });
  }

  private toResponse(prize: Prize): PrizeResponse {
    return {
      id: prize.id,
      event_id: prize.eventId,
      name: prize.name,
      description: prize.description,
      sort_order: prize.sortOrder,
      created_at: prize.createdAt.toISOString(),
      updated_at: prize.updatedAt.toISOString(),
    };
  }
}
