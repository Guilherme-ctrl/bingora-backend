import { HttpStatus, Injectable } from '@nestjs/common';
import { BingoCard, BingoCardStatus, OrganizerRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import { EventsService } from '../events/events.service';
import { fingerprintGrid, generateRandomGrid } from './bingo-grid';
import type { BingoGridPayload } from './bingo-grid';
import type { GenerateCardsDto } from './dto/generate-cards.dto';
import type { ListCardsQueryDto } from './dto/list-cards-query.dto';

export type CardResponse = {
  id: string;
  event_id: string;
  serial_number: number;
  status: BingoCardStatus;
  grid: BingoGridPayload;
  created_at: string;
};

const MAX_GENERATION_ATTEMPTS_PER_CARD = 500;

@Injectable()
export class CardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async generate(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: GenerateCardsDto,
    sellerEventIds: string[],
  ): Promise<{ generated_count: number; event_id: string }> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bingoCard.count({ where: { eventId } });
      if (existing > 0) {
        throw new ApiException(
          'CARDS_ALREADY_EXIST',
          'Cards already exist for this event. Regeneration is blocked in MVP.',
          HttpStatus.CONFLICT,
        );
      }

      const usedFingerprints = new Set<string>();
      const batch: Prisma.BingoCardCreateManyInput[] = [];

      for (let serial = 1; serial <= dto.count; serial++) {
        let fingerprint = '';
        let grid: BingoGridPayload | null = null;

        for (
          let attempt = 0;
          attempt < MAX_GENERATION_ATTEMPTS_PER_CARD;
          attempt++
        ) {
          const g = generateRandomGrid();
          const fp = fingerprintGrid(g);
          if (!usedFingerprints.has(fp)) {
            grid = g;
            fingerprint = fp;
            usedFingerprints.add(fp);
            break;
          }
        }

        if (!grid) {
          throw new ApiException(
            'CARD_GENERATION_FAILED',
            'Could not generate a unique card grid after multiple attempts.',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        batch.push({
          eventId,
          serialNumber: serial,
          grid: grid as unknown as Prisma.InputJsonValue,
          gridFingerprint: fingerprint,
          status: BingoCardStatus.available,
        });
      }

      await tx.bingoCard.createMany({ data: batch });
    });

    return { generated_count: dto.count, event_id: eventId };
  }

  async list(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    query: ListCardsQueryDto,
    sellerEventIds: string[],
  ): Promise<{
    items: CardResponse[];
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

    const where: Prisma.BingoCardWhereInput = { eventId };
    if (query.status !== undefined) {
      where.status = query.status;
    }
    if (query.serial_number !== undefined) {
      where.serialNumber = query.serial_number;
    }

    const skip = (page - 1) * page_size;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.bingoCard.findMany({
        where,
        orderBy: [{ serialNumber: 'asc' }],
        skip,
        take: page_size,
      }),
      this.prisma.bingoCard.count({ where }),
    ]);

    return {
      items: rows.map((c) => this.toResponse(c)),
      page,
      page_size,
      total,
    };
  }

  /** Full export for printing; not paginated (MVP). */
  async exportJson(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<CardResponse[]> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const rows = await this.prisma.bingoCard.findMany({
      where: { eventId },
      orderBy: { serialNumber: 'asc' },
    });

    return rows.map((c) => this.toResponse(c));
  }

  /**
   * Apenas números de série de cartelas disponíveis — para atribuição em vendas
   * (vendedores podem chamar; não expõe o grid).
   */
  async listAvailableSerialNumbers(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<{ serial_numbers: number[] }> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );
    const rows = await this.prisma.bingoCard.findMany({
      where: { eventId, status: BingoCardStatus.available },
      select: { serialNumber: true },
      orderBy: { serialNumber: 'asc' },
    });
    return { serial_numbers: rows.map((r) => r.serialNumber) };
  }

  async exportCsv(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<string> {
    const cards = await this.exportJson(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );
    const lines = ['id,event_id,serial_number,status,grid_json'];
    for (const c of cards) {
      const gridJson = JSON.stringify(c.grid).replaceAll('"', '""');
      lines.push(
        `${c.id},${c.event_id},${c.serial_number},${c.status},"${gridJson}"`,
      );
    }
    return lines.join('\n');
  }

  private toResponse(card: BingoCard): CardResponse {
    return {
      id: card.id,
      event_id: card.eventId,
      serial_number: card.serialNumber,
      status: card.status,
      grid: card.grid as unknown as BingoGridPayload,
      created_at: card.createdAt.toISOString(),
    };
  }
}
