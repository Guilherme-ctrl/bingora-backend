import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import {
  DomainEventType,
  EventOperationalRole,
  OrganizerRole,
  Prisma,
  Round,
  RoundStatus,
  RoundType,
  SellerReconciliationStatus,
} from "@prisma/client";
import { ApiException } from "../common/exceptions/api.exception";
import { PrismaService } from "../prisma/prisma.service";
import { canTransitionRound } from "./round-state.machine";
import { EventsService } from "../events/events.service";

type CreateRoundInput = {
  organizerId: string;
  organizerRole: OrganizerRole;
  sellerEventIds: string[];
  eventId: string;
  code: string;
  type: RoundType;
};

@Injectable()
export class RoundsService {
  private readonly logger = new Logger(RoundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async create(input: CreateRoundInput): Promise<Round> {
    await this.events.findEventForAccess(
      input.organizerId,
      input.organizerRole,
      input.eventId,
      input.sellerEventIds,
    );
    await this.assertRoundPermission(
      input.organizerId,
      input.organizerRole,
      input.eventId,
      "round.create",
    );

    const existing = await this.findActiveByEventId(input.eventId);
    if (existing) {
      throw new ApiException(
        "ROUND_ACTIVE_ALREADY_EXISTS",
        "There is already an active round for this event.",
        HttpStatus.CONFLICT,
      );
    }

    try {
      return await this.prisma.round.create({
        data: {
          eventId: input.eventId,
          code: input.code,
          type: input.type,
          status: RoundStatus.CRIADA,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = Array.isArray(error.meta?.target)
            ? error.meta?.target.join(",")
            : String(error.meta?.target ?? "");
          if (target.includes("round_single_active_per_event_idx")) {
            throw new ApiException(
              "ROUND_ACTIVE_ALREADY_EXISTS",
              "There is already an active round for this event.",
              HttpStatus.CONFLICT,
            );
          }
          throw new ApiException(
            "ROUND_CODE_CONFLICT",
            "Round code already exists for this event.",
            HttpStatus.CONFLICT,
          );
        }

        if (error.code === "P2004") {
          throw new ApiException(
            "ROUND_ACTIVE_ALREADY_EXISTS",
            "There is already an active round for this event.",
            HttpStatus.CONFLICT,
          );
        }
      }
      throw error;
    }
  }

  async transition(roundId: string, targetStatus: RoundStatus): Promise<Round> {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });
    if (!round) {
      throw new ApiException(
        "ROUND_NOT_FOUND",
        "Round not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (round.status === targetStatus) {
      return round;
    }

    if (!canTransitionRound(round.status, targetStatus)) {
      throw new ApiException(
        "ROUND_INVALID_TRANSITION",
        `Cannot transition round from ${round.status} to ${targetStatus}.`,
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.round.update({
      where: { id: round.id },
      data: {
        status: targetStatus,
        finishedAt:
          targetStatus === RoundStatus.FINALIZADA
            ? new Date()
            : round.finishedAt,
      },
    });
  }

  async openSales(
    organizerId: string,
    organizerRole: OrganizerRole,
    roundId: string,
  ): Promise<Round> {
    const round = await this.requireRound(roundId);
    await this.assertRoundPermission(
      organizerId,
      organizerRole,
      round.eventId,
      "round.open_sales",
    );
    return this.transition(roundId, RoundStatus.EM_VENDA);
  }

  async closeSales(
    organizerId: string,
    organizerRole: OrganizerRole,
    roundId: string,
  ): Promise<Round> {
    const round = await this.requireRound(roundId);
    await this.assertRoundPermission(
      organizerId,
      organizerRole,
      round.eventId,
      "round.close_sales",
    );
    return this.transition(roundId, RoundStatus.AGUARDANDO_CONFERENCIA);
  }

  async startDraw(
    organizerId: string,
    organizerRole: OrganizerRole,
    roundId: string,
  ): Promise<Round> {
    const round = await this.requireRound(roundId);
    await this.assertRoundPermission(
      organizerId,
      organizerRole,
      round.eventId,
      "round.start_draw",
    );
    await this.assertAllSellersReconciled(round.id, round.eventId);
    return this.transition(roundId, RoundStatus.EM_SORTEIO);
  }

  async finish(
    organizerId: string,
    organizerRole: OrganizerRole,
    roundId: string,
  ): Promise<Round> {
    const round = await this.requireRound(roundId);
    await this.assertRoundPermission(
      organizerId,
      organizerRole,
      round.eventId,
      "round.finish",
    );
    const updated = await this.transition(roundId, RoundStatus.FINALIZADA);
    await this.prisma.domainEventLog.create({
      data: {
        eventId: updated.eventId,
        roundId: updated.id,
        actorId: organizerId,
        actorRole: organizerRole,
        eventType: DomainEventType.RODADA_FINALIZADA,
        payloadJson: {
          round_id: updated.id,
          status: updated.status,
        },
      },
    });
    this.logger.log(
      JSON.stringify({
        event: "domain_event",
        event_type: DomainEventType.RODADA_FINALIZADA,
        event_id: updated.eventId,
        round_id: updated.id,
        actor_id: organizerId,
      }),
    );
    return updated;
  }

  async listSellerReconciliation(
    organizerId: string,
    organizerRole: OrganizerRole,
    roundId: string,
  ) {
    const round = await this.requireRound(roundId);
    await this.assertRoundPermission(
      organizerId,
      organizerRole,
      round.eventId,
      "round.start_draw",
    );
    const sellers = await this.prisma.eventSeller.findMany({
      where: { eventId: round.eventId },
      select: {
        sellerOrganizerId: true,
        seller: { select: { email: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    const reconciliations = await this.prisma.sellerReconciliation.findMany({
      where: { roundId: round.id },
    });
    const bySeller = new Map(
      reconciliations.map((item) => [item.sellerOrganizerId, item]),
    );
    return {
      round_id: round.id,
      items: sellers.map((seller) => {
        const rec = bySeller.get(seller.sellerOrganizerId);
        return {
          seller_organizer_id: seller.sellerOrganizerId,
          seller_email: seller.seller.email,
          status: rec?.status ?? null,
          justification: rec?.justification ?? null,
          updated_at: rec?.updatedAt.toISOString() ?? null,
        };
      }),
    };
  }

  async reconcileSeller(
    organizerId: string,
    organizerRole: OrganizerRole,
    roundId: string,
    sellerOrganizerId: string,
    status: SellerReconciliationStatus,
    justification?: string | null,
  ) {
    const round = await this.requireRound(roundId);
    await this.assertRoundPermission(
      organizerId,
      organizerRole,
      round.eventId,
      "round.start_draw",
    );
    if (status === SellerReconciliationStatus.DIVERGENTE && !justification) {
      throw new ApiException(
        "RECONCILIATION_JUSTIFICATION_REQUIRED",
        "Justification is required for DIVERGENTE.",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.eventSeller.findFirstOrThrow({
      where: { eventId: round.eventId, sellerOrganizerId },
    });

    const rec = await this.prisma.sellerReconciliation.upsert({
      where: {
        roundId_sellerOrganizerId: {
          roundId: round.id,
          sellerOrganizerId,
        },
      },
      create: {
        roundId: round.id,
        sellerOrganizerId,
        status,
        justification: justification ?? null,
        checkedByOrganizerId: organizerId,
      },
      update: {
        status,
        justification: justification ?? null,
        checkedByOrganizerId: organizerId,
      },
    });

    await this.prisma.domainEventLog.create({
      data: {
        eventId: round.eventId,
        roundId: round.id,
        actorId: organizerId,
        actorRole: organizerRole,
        eventType:
          status === SellerReconciliationStatus.CONFERIDO
            ? DomainEventType.VENDEDOR_CONFERIDO
            : DomainEventType.VENDEDOR_DIVERGENTE,
        payloadJson: {
          seller_organizer_id: sellerOrganizerId,
          status,
          justification: justification ?? null,
        },
      },
    });
    this.logger.log(
      JSON.stringify({
        event: "domain_event",
        event_type:
          status === SellerReconciliationStatus.CONFERIDO
            ? DomainEventType.VENDEDOR_CONFERIDO
            : DomainEventType.VENDEDOR_DIVERGENTE,
        event_id: round.eventId,
        round_id: round.id,
        actor_id: organizerId,
        seller_organizer_id: sellerOrganizerId,
      }),
    );

    return {
      id: rec.id,
      round_id: rec.roundId,
      seller_organizer_id: rec.sellerOrganizerId,
      status: rec.status,
      justification: rec.justification,
      updated_at: rec.updatedAt.toISOString(),
    };
  }

  async findActiveByEventId(eventId: string): Promise<Round | null> {
    return this.prisma.round.findFirst({
      where: {
        eventId,
        status: {
          in: [
            RoundStatus.CRIADA,
            RoundStatus.EM_VENDA,
            RoundStatus.AGUARDANDO_CONFERENCIA,
            RoundStatus.EM_SORTEIO,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getActiveRoundForEvent(
    organizerId: string,
    organizerRole: OrganizerRole,
    sellerEventIds: string[],
    eventId: string,
  ): Promise<Round | null> {
    await this.events.findEventForAccess(
      organizerId,
      organizerRole,
      eventId,
      sellerEventIds,
    );
    return this.findActiveByEventId(eventId);
  }

  async getRoundById(
    organizerId: string,
    organizerRole: OrganizerRole,
    sellerEventIds: string[],
    roundId: string,
  ): Promise<Round> {
    const round = await this.requireRound(roundId);
    await this.events.findEventForAccess(
      organizerId,
      organizerRole,
      round.eventId,
      sellerEventIds,
    );
    return round;
  }

  private async requireRound(roundId: string): Promise<Round> {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });
    if (!round) {
      throw new ApiException(
        "ROUND_NOT_FOUND",
        "Round not found.",
        HttpStatus.NOT_FOUND,
      );
    }
    return round;
  }

  private async assertAllSellersReconciled(
    roundId: string,
    eventId: string,
  ): Promise<void> {
    const sellers = await this.prisma.eventSeller.findMany({
      where: { eventId },
      select: { sellerOrganizerId: true },
    });
    if (sellers.length === 0) {
      return;
    }

    const reconciled = await this.prisma.sellerReconciliation.findMany({
      where: {
        roundId,
        sellerOrganizerId: { in: sellers.map((s) => s.sellerOrganizerId) },
        status: SellerReconciliationStatus.CONFERIDO,
      },
      select: { sellerOrganizerId: true },
    });

    const ok = new Set(reconciled.map((r) => r.sellerOrganizerId));
    const missing = sellers
      .map((s) => s.sellerOrganizerId)
      .filter((sellerId) => !ok.has(sellerId));

    if (missing.length > 0) {
      throw new ApiException(
        "ROUND_RECONCILIATION_PENDING",
        "Cannot start draw while there are sellers pending reconciliation.",
        HttpStatus.CONFLICT,
        { pending_seller_ids: missing },
      );
    }
  }

  private async assertRoundPermission(
    organizerId: string,
    organizerRole: OrganizerRole,
    eventId: string,
    action:
      | "round.create"
      | "round.open_sales"
      | "round.close_sales"
      | "round.start_draw"
      | "round.finish",
  ): Promise<void> {
    if (organizerRole === OrganizerRole.admin) {
      return;
    }

    const roles = await this.prisma.eventRoleAssignment.findMany({
      where: { eventId, organizerId },
      select: { role: true },
    });
    const roleSet = new Set(roles.map((r) => r.role));

    const allowedByAction: Record<string, EventOperationalRole[]> = {
      "round.create": [EventOperationalRole.admin_evento],
      "round.open_sales": [EventOperationalRole.admin_evento],
      "round.close_sales": [EventOperationalRole.admin_evento],
      "round.start_draw": [
        EventOperationalRole.admin_evento,
        EventOperationalRole.mesario,
      ],
      "round.finish": [
        EventOperationalRole.admin_evento,
        EventOperationalRole.mesario,
      ],
    };

    if (!allowedByAction[action].some((role) => roleSet.has(role))) {
      throw new ApiException("FORBIDDEN", "Forbidden.", HttpStatus.FORBIDDEN);
    }
  }
}
