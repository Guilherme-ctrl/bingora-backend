import { HttpStatus, Injectable } from "@nestjs/common";
import {
  BingoCard,
  BingoCardStatus,
  OrganizerRole,
  PaymentStatus,
  Prisma,
  Sale,
  SaleStatus,
} from "@prisma/client";
import { canAccessOrganizerResource } from "../common/access/organizer-resource-access";
import { PrismaService } from "../prisma/prisma.service";
import { ApiException } from "../common/exceptions/api.exception";
import { EventsService } from "../events/events.service";
import { isEventLocked } from "../events/event-status.policy";
import type { CreateSaleDto } from "./dto/create-sale.dto";
import type { UpdateSaleDto } from "./dto/update-sale.dto";
import type { ListSalesQueryDto } from "./dto/list-sales-query.dto";

export type SaleCardSummary = {
  bingo_card_id: string;
  serial_number: number;
};

export type SaleResponse = {
  id: string;
  event_id: string;
  participant_id: string;
  quantity: number;
  payment_status: PaymentStatus;
  unit_price_cents: number | null;
  currency: string;
  notes: string | null;
  status: SaleStatus;
  cards: SaleCardSummary[];
  created_at: string;
  updated_at: string;
};

export type SaleSummary = {
  id: string;
  event_id: string;
  participant_id: string;
  quantity: number;
  payment_status: PaymentStatus;
  unit_price_cents: number | null;
  currency: string;
  notes: string | null;
  status: SaleStatus;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async create(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: CreateSaleDto,
    sellerEventIds: string[],
  ): Promise<SaleResponse> {
    const event = await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    if (isEventLocked(event.status)) {
      throw new ApiException(
        "EVENT_LOCKED",
        "Sales cannot be created while the event is completed or cancelled.",
        HttpStatus.CONFLICT,
      );
    }

    const currency = dto.currency ?? "USD";

    const result = await this.prisma.$transaction(
      async (tx) => {
        const participant = await tx.participant.findFirst({
          where: { id: dto.participant_id, eventId },
        });

        if (!participant) {
          throw new ApiException(
            "PARTICIPANT_NOT_FOUND",
            "Participant not found for this event.",
            HttpStatus.NOT_FOUND,
          );
        }

        const requestedSerials =
          dto.serial_numbers?.filter((n) => Number.isFinite(n) && n >= 1) ?? [];
        const useExplicitSerials = requestedSerials.length > 0;

        let cardsToAssign: BingoCard[];

        if (useExplicitSerials) {
          if (requestedSerials.length !== dto.quantity) {
            throw new ApiException(
              "SALE_SERIAL_COUNT_MISMATCH",
              `Informe exatamente ${dto.quantity} número(s) de cartela, ou omita serial_numbers para atribuir automaticamente.`,
              HttpStatus.BAD_REQUEST,
            );
          }
          const uniq = new Set(requestedSerials);
          if (uniq.size !== requestedSerials.length) {
            throw new ApiException(
              "DUPLICATE_SERIAL_IN_REQUEST",
              "Números de cartela repetidos na solicitação.",
              HttpStatus.BAD_REQUEST,
            );
          }

          const bySerial = await tx.bingoCard.findMany({
            where: {
              eventId,
              serialNumber: { in: requestedSerials },
            },
          });

          if (bySerial.length !== requestedSerials.length) {
            const found = new Set(bySerial.map((c) => c.serialNumber));
            const missing = requestedSerials.filter((s) => !found.has(s));
            throw new ApiException(
              "CARD_SERIAL_NOT_FOUND",
              `Número(s) de cartela inexistente(s) neste evento: ${missing.join(", ")}.`,
              HttpStatus.NOT_FOUND,
            );
          }

          const notAvail = bySerial.filter(
            (c) => c.status !== BingoCardStatus.available,
          );
          if (notAvail.length > 0) {
            throw new ApiException(
              "CARD_NOT_AVAILABLE",
              `Cartela(s) não disponível(is): ${notAvail.map((c) => c.serialNumber).join(", ")}.`,
              HttpStatus.CONFLICT,
            );
          }

          cardsToAssign = [...bySerial].sort(
            (a, b) => a.serialNumber - b.serialNumber,
          );
        } else {
          const available = await tx.bingoCard.findMany({
            where: { eventId, status: BingoCardStatus.available },
            orderBy: { serialNumber: "asc" },
            take: dto.quantity,
          });

          if (available.length < dto.quantity) {
            throw new ApiException(
              "INSUFFICIENT_CARDS",
              "Not enough available bingo cards for this sale.",
              HttpStatus.CONFLICT,
            );
          }

          cardsToAssign = available;
        }

        const sale = await tx.sale.create({
          data: {
            eventId,
            participantId: dto.participant_id,
            quantity: dto.quantity,
            paymentStatus: dto.payment_status,
            unitPriceCents: dto.unit_price_cents ?? null,
            currency,
            notes: dto.notes ?? null,
            status: SaleStatus.active,
          },
        });

        for (const card of cardsToAssign) {
          await tx.saleCard.create({
            data: {
              saleId: sale.id,
              bingoCardId: card.id,
            },
          });
          await tx.bingoCard.update({
            where: { id: card.id },
            data: { status: BingoCardStatus.assigned },
          });
        }

        return await this.loadSaleResponse(tx, sale.id);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return result;
  }

  async listByEvent(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    query: ListSalesQueryDto,
    sellerEventIds: string[],
  ): Promise<{
    items: SaleSummary[];
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

    const where: Prisma.SaleWhereInput = { eventId };
    if (query.payment_status !== undefined) {
      where.paymentStatus = query.payment_status;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: page_size,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      items: rows.map((s) => this.toSummary(s)),
      page,
      page_size,
      total,
    };
  }

  async getById(
    organizerId: string,
    role: OrganizerRole,
    saleId: string,
    sellerEventIds: string[],
  ): Promise<SaleResponse> {
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId },
      include: {
        event: true,
        saleCards: { include: { bingoCard: true } },
      },
    });

    if (
      !sale ||
      !canAccessOrganizerResource(
        organizerId,
        sale.event.organizerId,
        role,
        sellerEventIds,
        sale.eventId,
      )
    ) {
      throw new ApiException(
        "SALE_NOT_FOUND",
        "Sale not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toResponse(sale, sale.saleCards);
  }

  async update(
    organizerId: string,
    role: OrganizerRole,
    saleId: string,
    dto: UpdateSaleDto,
    sellerEventIds: string[],
  ): Promise<SaleResponse> {
    const existing = await this.prisma.sale.findFirst({
      where: { id: saleId },
      include: { event: true },
    });

    if (
      !existing ||
      !canAccessOrganizerResource(
        organizerId,
        existing.event.organizerId,
        role,
        sellerEventIds,
        existing.eventId,
      )
    ) {
      throw new ApiException(
        "SALE_NOT_FOUND",
        "Sale not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (existing.status === SaleStatus.voided) {
      throw new ApiException(
        "SALE_VOIDED",
        "Cannot update a voided sale.",
        HttpStatus.CONFLICT,
      );
    }

    const hasPatch =
      dto.payment_status !== undefined ||
      dto.unit_price_cents !== undefined ||
      dto.currency !== undefined ||
      dto.notes !== undefined;

    if (!hasPatch) {
      return this.getById(organizerId, role, saleId, sellerEventIds);
    }

    await this.prisma.sale.update({
      where: { id: saleId },
      data: {
        ...(dto.payment_status !== undefined
          ? { paymentStatus: dto.payment_status }
          : {}),
        ...(dto.unit_price_cents !== undefined
          ? { unitPriceCents: dto.unit_price_cents }
          : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    return this.getById(organizerId, role, saleId, sellerEventIds);
  }

  async void(
    organizerId: string,
    role: OrganizerRole,
    saleId: string,
    sellerEventIds: string[],
  ): Promise<SaleResponse> {
    const existing = await this.prisma.sale.findFirst({
      where: { id: saleId },
      include: {
        event: true,
        saleCards: true,
      },
    });

    if (
      !existing ||
      !canAccessOrganizerResource(
        organizerId,
        existing.event.organizerId,
        role,
        sellerEventIds,
        existing.eventId,
      )
    ) {
      throw new ApiException(
        "SALE_NOT_FOUND",
        "Sale not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEventLocked(existing.event.status)) {
      throw new ApiException(
        "EVENT_LOCKED",
        "This sale cannot be voided while the event is completed or cancelled.",
        HttpStatus.CONFLICT,
      );
    }

    if (existing.status === SaleStatus.voided) {
      return this.getById(organizerId, role, saleId, sellerEventIds);
    }

    const cardIds = existing.saleCards.map((sc) => sc.bingoCardId);

    await this.prisma.$transaction(async (tx) => {
      await tx.saleCard.deleteMany({ where: { saleId } });
      if (cardIds.length > 0) {
        await tx.bingoCard.updateMany({
          where: { id: { in: cardIds } },
          data: { status: BingoCardStatus.available },
        });
      }
      await tx.sale.update({
        where: { id: saleId },
        data: { status: SaleStatus.voided },
      });
    });

    return this.getById(organizerId, role, saleId, sellerEventIds);
  }

  private async loadSaleResponse(
    tx: Prisma.TransactionClient,
    saleId: string,
  ): Promise<SaleResponse> {
    const sale = await tx.sale.findFirstOrThrow({
      where: { id: saleId },
      include: {
        saleCards: { include: { bingoCard: true } },
      },
    });

    return this.toResponse(sale, sale.saleCards);
  }

  private toSummary(sale: Sale): SaleSummary {
    return {
      id: sale.id,
      event_id: sale.eventId,
      participant_id: sale.participantId,
      quantity: sale.quantity,
      payment_status: sale.paymentStatus,
      unit_price_cents: sale.unitPriceCents,
      currency: sale.currency,
      notes: sale.notes,
      status: sale.status,
      created_at: sale.createdAt.toISOString(),
      updated_at: sale.updatedAt.toISOString(),
    };
  }

  private toResponse(
    sale: Sale,
    saleCards: Array<{ bingoCard: BingoCard }>,
  ): SaleResponse {
    const cards: SaleCardSummary[] = saleCards.map((sc) => ({
      bingo_card_id: sc.bingoCard.id,
      serial_number: sc.bingoCard.serialNumber,
    }));

    return {
      id: sale.id,
      event_id: sale.eventId,
      participant_id: sale.participantId,
      quantity: sale.quantity,
      payment_status: sale.paymentStatus,
      unit_price_cents: sale.unitPriceCents,
      currency: sale.currency,
      notes: sale.notes,
      status: sale.status,
      cards,
      created_at: sale.createdAt.toISOString(),
      updated_at: sale.updatedAt.toISOString(),
    };
  }
}
