import { HttpStatus, Injectable } from '@nestjs/common';
import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';

export type OrganizerProfileDto = {
  id: string;
  email: string;
  role: OrganizerRole;
  created_at: string;
  /** Presente quando `role` é `seller`: eventos em que pode vender. */
  seller_event_ids?: string[];
};

@Injectable()
export class OrganizersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(organizerId: string): Promise<OrganizerProfileDto> {
    const organizer = await this.prisma.organizer.findUnique({
      where: { id: organizerId },
    });
    if (!organizer) {
      throw new ApiException(
        'ORGANIZER_NOT_FOUND',
        'Organizer not found.',
        HttpStatus.NOT_FOUND,
      );
    }
    const base = {
      id: organizer.id,
      email: organizer.email,
      role: organizer.role,
      created_at: organizer.createdAt.toISOString(),
    };
    if (organizer.role === OrganizerRole.seller) {
      const links = await this.prisma.eventSeller.findMany({
        where: { sellerOrganizerId: organizer.id },
        select: { eventId: true },
      });
      return {
        ...base,
        seller_event_ids: links.map((l) => l.eventId),
      };
    }
    return base;
  }
}
