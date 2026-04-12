import { HttpStatus, Injectable } from '@nestjs/common';
import { EventStatus, OrganizerRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import {
  assertAllowedCreateStatus,
  assertValidStatusTransition,
  isEventLocked,
} from './event-status.policy';
import type { CreateEventDto } from './dto/create-event.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { ListEventsQueryDto } from './dto/list-events-query.dto';

const organizerEmailInclude = {
  organizer: { select: { email: true } },
} as const;

export type EventWithOrganizerEmail = Prisma.EventGetPayload<{
  include: typeof organizerEmailInclude;
}>;

export type EventResponse = {
  id: string;
  organizer_id: string;
  /** E-mail do organizador dono do evento (identificação legível). */
  organizer_email: string;
  title: string;
  starts_at: string;
  timezone: string;
  venue_notes: string | null;
  default_unit_price_cents: number | null;
  default_currency: string;
  /** Caminho público da logo em `/uploads/...` ou null. */
  logo_url: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizerId: string,
    query: ListEventsQueryDto,
    role: OrganizerRole,
    sellerEventIds: string[],
  ): Promise<{
    items: EventResponse[];
    page: number;
    page_size: number;
    total: number;
  }> {
    const page = query.page ?? 1;
    const page_size = query.page_size ?? 25;
    const where: Prisma.EventWhereInput = {};
    if (role === OrganizerRole.seller) {
      if (sellerEventIds.length === 0) {
        return { items: [], page, page_size, total: 0 };
      }
      where.id = { in: sellerEventIds };
    } else if (role !== OrganizerRole.admin) {
      where.organizerId = organizerId;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const sortField = query.sort ?? 'starts_at';
    const order = query.order ?? 'desc';
    const orderBy: Prisma.EventOrderByWithRelationInput =
      sortField === 'created_at' ? { createdAt: order } : { startsAt: order };

    const skip = (page - 1) * page_size;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: page_size,
        include: organizerEmailInclude,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      items: rows.map((e) => this.toResponse(e)),
      page,
      page_size,
      total,
    };
  }

  async create(
    organizerId: string,
    dto: CreateEventDto,
  ): Promise<EventResponse> {
    const status = dto.status ?? EventStatus.draft;
    assertAllowedCreateStatus(status);

    const event = await this.prisma.event.create({
      data: {
        organizerId,
        title: dto.title,
        startsAt: new Date(dto.starts_at),
        timezone: dto.timezone,
        venueNotes: dto.venue_notes ?? null,
        defaultUnitPriceCents: dto.default_unit_price_cents ?? null,
        defaultCurrency: dto.default_currency ?? 'BRL',
        status,
      },
      include: organizerEmailInclude,
    });

    return this.toResponse(event);
  }

  async getById(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<EventResponse> {
    const event = await this.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );
    return this.toResponse(event);
  }

  async update(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: UpdateEventDto,
    sellerEventIds: string[],
  ): Promise<EventResponse> {
    const existing = await this.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const hasPatch = this.updateDtoHasKeys(dto);
    if (!hasPatch) {
      return this.toResponse(existing);
    }

    if (isEventLocked(existing.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'This event is completed or cancelled and cannot be modified.',
        HttpStatus.CONFLICT,
      );
    }

    if (dto.status !== undefined) {
      assertValidStatusTransition(existing.status, dto.status);
    }

    const data: Prisma.EventUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }
    if (dto.starts_at !== undefined) {
      data.startsAt = new Date(dto.starts_at);
    }
    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone;
    }
    if (dto.venue_notes !== undefined) {
      data.venueNotes = dto.venue_notes;
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }
    if (dto.default_unit_price_cents !== undefined) {
      data.defaultUnitPriceCents = dto.default_unit_price_cents;
    }
    if (dto.default_currency !== undefined) {
      data.defaultCurrency = dto.default_currency;
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data,
      include: organizerEmailInclude,
    });

    return this.toResponse(updated);
  }

  /**
   * Atualiza só `logo_url` após upload/remoção de arquivo (valida trava e caminho).
   */
  async persistLogoUrl(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
    logoUrl: string | null,
  ): Promise<EventResponse> {
    const existing = await this.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );
    if (isEventLocked(existing.status)) {
      throw new ApiException(
        'EVENT_LOCKED',
        'This event is completed or cancelled and cannot be modified.',
        HttpStatus.CONFLICT,
      );
    }
    if (logoUrl !== null) {
      const prefix = `/uploads/event-logos/${eventId}.`;
      if (!logoUrl.startsWith(prefix)) {
        throw new ApiException(
          'INVALID_LOGO_PATH',
          'Invalid logo path.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: { logoUrl },
      include: organizerEmailInclude,
    });
    return this.toResponse(updated);
  }

  /**
   * Member: event must belong to the organizer.
   * Admin: any event id (full access).
   * Seller: must be assigned via `EventSeller` for that event.
   */
  async findEventForAccess(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<EventWithOrganizerEmail> {
    if (role === OrganizerRole.admin) {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: organizerEmailInclude,
      });
      if (!event) {
        throw new ApiException(
          'EVENT_NOT_FOUND',
          'Event not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      return event;
    }
    if (role === OrganizerRole.seller) {
      if (!sellerEventIds.includes(eventId)) {
        throw new ApiException(
          'EVENT_NOT_FOUND',
          'Event not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: organizerEmailInclude,
      });
      if (!event) {
        throw new ApiException(
          'EVENT_NOT_FOUND',
          'Event not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      return event;
    }
    return this.findOwnedOrThrow(organizerId, eventId);
  }

  /** Member-only: event must belong to the organizer. */
  async findOwnedOrThrow(
    organizerId: string,
    eventId: string,
  ): Promise<EventWithOrganizerEmail> {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizerId },
      include: organizerEmailInclude,
    });
    if (!event) {
      throw new ApiException(
        'EVENT_NOT_FOUND',
        'Event not found.',
        HttpStatus.NOT_FOUND,
      );
    }
    return event;
  }

  private updateDtoHasKeys(dto: UpdateEventDto): boolean {
    return (
      dto.title !== undefined ||
      dto.starts_at !== undefined ||
      dto.timezone !== undefined ||
      dto.venue_notes !== undefined ||
      dto.status !== undefined ||
      dto.default_unit_price_cents !== undefined ||
      dto.default_currency !== undefined
    );
  }

  private toResponse(event: EventWithOrganizerEmail): EventResponse {
    return {
      id: event.id,
      organizer_id: event.organizerId,
      organizer_email: event.organizer.email,
      title: event.title,
      starts_at: event.startsAt.toISOString(),
      timezone: event.timezone,
      venue_notes: event.venueNotes,
      default_unit_price_cents: event.defaultUnitPriceCents,
      default_currency: event.defaultCurrency,
      logo_url: event.logoUrl,
      status: event.status,
      created_at: event.createdAt.toISOString(),
      updated_at: event.updatedAt.toISOString(),
    };
  }
}
