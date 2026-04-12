import { HttpStatus, Injectable } from '@nestjs/common';
import { OrganizerRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import { EventsService } from '../events/events.service';
import type { AddEventSellerDto } from './dto/add-event-seller.dto';

const BCRYPT_ROUNDS = 12;

export type EventSellerRow = {
  seller_organizer_id: string;
  email: string;
  created_at: string;
};

@Injectable()
export class EventSellersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Apenas dono do evento (ou admin). Vendedores não podem chamar.
   */
  async listForEvent(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<{ items: EventSellerRow[] }> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );
    if (role === OrganizerRole.seller) {
      throw new ApiException('FORBIDDEN', 'Forbidden.', HttpStatus.FORBIDDEN);
    }

    const rows = await this.prisma.eventSeller.findMany({
      where: { eventId },
      include: { seller: { select: { email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return {
      items: rows.map((r) => ({
        seller_organizer_id: r.sellerOrganizerId,
        email: r.seller.email,
        created_at: r.createdAt.toISOString(),
      })),
    };
  }

  async addToEvent(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: AddEventSellerDto,
    sellerEventIds: string[],
  ): Promise<EventSellerRow> {
    const event = await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );
    if (role === OrganizerRole.seller) {
      throw new ApiException('FORBIDDEN', 'Forbidden.', HttpStatus.FORBIDDEN);
    }
    if (role !== OrganizerRole.admin && event.organizerId !== organizerId) {
      throw new ApiException('FORBIDDEN', 'Forbidden.', HttpStatus.FORBIDDEN);
    }

    const email = this.normalizeEmail(dto.email);
    const existing = await this.prisma.organizer.findUnique({
      where: { email },
    });

    let sellerOrganizerId: string;

    if (!existing) {
      if (!dto.password || dto.password.length < 8) {
        throw new ApiException(
          'PASSWORD_REQUIRED',
          'Password is required (min 8 characters) when creating a new seller account.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      try {
        const created = await this.prisma.organizer.create({
          data: {
            email,
            passwordHash,
            role: OrganizerRole.seller,
          },
        });
        sellerOrganizerId = created.id;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          throw new ApiException(
            'EMAIL_ALREADY_REGISTERED',
            'An account with this email already exists.',
            HttpStatus.CONFLICT,
          );
        }
        throw e;
      }
    } else {
      if (existing.role !== OrganizerRole.seller) {
        throw new ApiException(
          'ORGANIZER_NOT_SELLER',
          'This email belongs to an account that is not a seller. Use a different email.',
          HttpStatus.CONFLICT,
        );
      }
      sellerOrganizerId = existing.id;
    }

    try {
      const link = await this.prisma.eventSeller.create({
        data: {
          eventId,
          sellerOrganizerId,
        },
        include: { seller: { select: { email: true } } },
      });
      return {
        seller_organizer_id: link.sellerOrganizerId,
        email: link.seller.email,
        created_at: link.createdAt.toISOString(),
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ApiException(
          'SELLER_ALREADY_LINKED',
          'This seller is already assigned to this event.',
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }
  }

  async removeFromEvent(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerOrganizerId: string,
    sellerEventIds: string[],
  ): Promise<void> {
    const event = await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );
    if (role === OrganizerRole.seller) {
      throw new ApiException('FORBIDDEN', 'Forbidden.', HttpStatus.FORBIDDEN);
    }
    if (role !== OrganizerRole.admin && event.organizerId !== organizerId) {
      throw new ApiException('FORBIDDEN', 'Forbidden.', HttpStatus.FORBIDDEN);
    }

    const res = await this.prisma.eventSeller.deleteMany({
      where: { eventId, sellerOrganizerId },
    });
    if (res.count === 0) {
      throw new ApiException(
        'EVENT_SELLER_NOT_FOUND',
        'Seller assignment not found for this event.',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
