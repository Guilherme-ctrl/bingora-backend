import { HttpStatus, Injectable } from '@nestjs/common';
import { OrganizerRole, Participant, Prisma, SaleStatus } from '@prisma/client';
import { canAccessOrganizerResource } from '../common/access/organizer-resource-access';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import { EventsService } from '../events/events.service';
import { isEventLocked } from '../events/event-status.policy';
import type { CreateParticipantDto } from './dto/create-participant.dto';
import type { UpdateParticipantDto } from './dto/update-participant.dto';
import type { ListParticipantsQueryDto } from './dto/list-participants-query.dto';

export type ParticipantResponse = {
  id: string;
  event_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async list(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    query: ListParticipantsQueryDto,
    sellerEventIds: string[],
  ): Promise<{
    items: ParticipantResponse[];
    page: number;
    page_size: number;
    total: number;
  }> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const page = query.page ?? 1;
    const page_size = query.page_size ?? 25;
    const skip = (page - 1) * page_size;

    const where: Prisma.ParticipantWhereInput = { eventId };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.participant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: page_size,
      }),
      this.prisma.participant.count({ where }),
    ]);

    return {
      items: rows.map((p) => this.toResponse(p)),
      page,
      page_size,
      total,
    };
  }

  async create(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: CreateParticipantDto,
    sellerEventIds: string[],
  ): Promise<ParticipantResponse> {
    const event = await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    if (isEventLocked(event.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'Participants cannot be modified while the event is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }

    const participant = await this.prisma.participant.create({
      data: {
        eventId,
        displayName: dto.display_name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        notes: dto.notes ?? null,
      },
    });

    return this.toResponse(participant);
  }

  async update(
    organizerId: string,
    role: OrganizerRole,
    participantId: string,
    dto: UpdateParticipantDto,
    sellerEventIds: string[],
  ): Promise<ParticipantResponse> {
    const participant = await this.prisma.participant.findFirst({
      where: { id: participantId },
      include: { event: true },
    });

    if (
      !participant ||
      !canAccessOrganizerResource(
        organizerId,
        participant.event.organizerId,
        role,
        sellerEventIds,
        participant.eventId,
      )
    ) {
      throw new ApiException(
        'PARTICIPANT_NOT_FOUND',
        'Participant not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEventLocked(participant.event.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'Participants cannot be modified while the event is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }

    const hasPatch =
      dto.display_name !== undefined ||
      dto.email !== undefined ||
      dto.phone !== undefined ||
      dto.notes !== undefined;

    if (!hasPatch) {
      return this.toResponse(participant);
    }

    const updated = await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        ...(dto.display_name !== undefined
          ? { displayName: dto.display_name }
          : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    return this.toResponse(updated);
  }

  async delete(
    organizerId: string,
    role: OrganizerRole,
    participantId: string,
    sellerEventIds: string[],
  ): Promise<void> {
    const participant = await this.prisma.participant.findFirst({
      where: { id: participantId },
      include: { event: true },
    });

    if (
      !participant ||
      !canAccessOrganizerResource(
        organizerId,
        participant.event.organizerId,
        role,
        sellerEventIds,
        participant.eventId,
      )
    ) {
      throw new ApiException(
        'PARTICIPANT_NOT_FOUND',
        'Participant not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEventLocked(participant.event.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'Participants cannot be modified while the event is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }

    const activeSale = await this.prisma.sale.findFirst({
      where: { participantId, status: SaleStatus.active },
    });

    if (activeSale) {
      throw new ApiException(
        'PARTICIPANT_HAS_ACTIVE_SALES',
        'Cannot delete a participant that has active sales.',
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.participant.delete({ where: { id: participantId } });
  }

  private toResponse(p: Participant): ParticipantResponse {
    return {
      id: p.id,
      event_id: p.eventId,
      display_name: p.displayName,
      email: p.email,
      phone: p.phone,
      notes: p.notes,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    };
  }
}
