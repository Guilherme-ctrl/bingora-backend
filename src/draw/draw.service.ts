import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import {
  DomainEventType,
  DrawCall,
  DrawCallStatus,
  DrawSession,
  DrawSessionStatus,
  EventStatus,
  OrganizerRole,
  RoundStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ApiException } from "../common/exceptions/api.exception";
import { EventsService } from "../events/events.service";
import { isPrismaUniqueViolation } from "../common/prisma/unique-violation";
import { assertBallNumberInRange, canUseDrawForEvent } from "./draw.policy";
import type { PostCallDto } from "./dto/post-call.dto";

export type DrawSessionResponse = {
  id: string;
  event_id: string;
  status: DrawSessionStatus;
  started_at: string;
  closed_at: string | null;
};

export type DrawCallResponse = {
  id: string;
  draw_session_id: string;
  sequence: number;
  ball_number: number;
  called_at: string;
  note: string | null;
};

export type DrawStateResponse = {
  session: DrawSessionResponse | null;
  calls: Array<{
    id: string;
    sequence: number;
    ball_number: number;
    called_at: string;
    status: DrawCallStatus;
    invalidated_at: string | null;
    invalidation_reason: string | null;
  }>;
  remaining_numbers: number[];
};

@Injectable()
export class DrawService {
  private readonly logger = new Logger(DrawService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async ensureSession(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<{ session: DrawSessionResponse; created: boolean }> {
    const event = await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const existing = await this.prisma.drawSession.findUnique({
      where: { eventId },
    });

    if (existing) {
      if (existing.status === DrawSessionStatus.closed) {
        throw new ApiException(
          "DRAW_SESSION_CLOSED",
          "The draw session for this event is already closed.",
          HttpStatus.CONFLICT,
        );
      }

      return { session: this.toSessionResponse(existing), created: false };
    }

    this.assertDrawableEvent(event.status);

    const created = await this.prisma.drawSession.create({
      data: { eventId, status: DrawSessionStatus.open },
    });

    return { session: this.toSessionResponse(created), created: true };
  }

  async postCall(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    dto: PostCallDto,
    sellerEventIds: string[],
  ): Promise<DrawCallResponse> {
    try {
      assertBallNumberInRange(dto.ball_number);
    } catch {
      throw new ApiException(
        "INVALID_BALL_NUMBER",
        "ball_number must be an integer from 1 to 75.",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const session = await this.requireOpenSession(eventId);

    try {
      const nextSequence = await this.nextSequence(session.id);

      const call = await this.prisma.drawCall.create({
        data: {
          drawSessionId: session.id,
          sequence: nextSequence,
          ballNumber: dto.ball_number,
          note: dto.note ?? null,
        },
      });

      await this.prisma.domainEventLog.create({
        data: {
          eventId,
          actorId: organizerId,
          actorRole: role,
          eventType: DomainEventType.NUMERO_SORTEADO,
          payloadJson: {
            draw_session_id: session.id,
            draw_call_id: call.id,
            sequence: call.sequence,
            ball_number: call.ballNumber,
          },
        },
      });
      this.logger.log(
        JSON.stringify({
          event: "domain_event",
          event_type: DomainEventType.NUMERO_SORTEADO,
          event_id: eventId,
          round_id: null,
          actor_id: organizerId,
          draw_call_id: call.id,
        }),
      );

      return this.toCallResponse(call);
    } catch (e) {
      if (isPrismaUniqueViolation(e)) {
        throw new ApiException(
          "DUPLICATE_BALL",
          "This ball number has already been called in this session.",
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }
  }

  async postCallInRound(
    organizerId: string,
    role: OrganizerRole,
    roundId: string,
    dto: PostCallDto,
    sellerEventIds: string[],
  ): Promise<DrawCallResponse> {
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
    if (round.status !== RoundStatus.EM_SORTEIO) {
      throw new ApiException(
        "ROUND_NOT_IN_DRAW",
        "Round must be in EM_SORTEIO to record draw calls.",
        HttpStatus.CONFLICT,
      );
    }
    return this.postCall(organizerId, role, round.eventId, dto, sellerEventIds);
  }

  async deleteLastCall(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<void> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const session = await this.prisma.drawSession.findUnique({
      where: { eventId },
    });

    if (!session || session.status !== DrawSessionStatus.open) {
      throw new ApiException(
        "DRAW_SESSION_NOT_OPEN",
        "No open draw session for this event.",
        HttpStatus.NOT_FOUND,
      );
    }

    const last = await this.prisma.drawCall.findFirst({
      where: { drawSessionId: session.id, status: DrawCallStatus.active },
      orderBy: { sequence: "desc" },
    });

    if (!last) {
      throw new ApiException(
        "NO_CALLS",
        "There are no calls to remove.",
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.drawCall.update({
        where: { id: last.id },
        data: {
          status: DrawCallStatus.invalidated,
          invalidatedAt: new Date(),
          invalidationReason: "LEGACY_DELETE_LAST_CALL",
        },
      });

      await tx.domainEventLog.create({
        data: {
          eventId,
          actorId: organizerId,
          actorRole: role,
          eventType: DomainEventType.NUMERO_INVALIDADO,
          payloadJson: {
            draw_session_id: session.id,
            draw_call_id: last.id,
            sequence: last.sequence,
            ball_number: last.ballNumber,
            reason: "LEGACY_DELETE_LAST_CALL",
          },
        },
      });
      this.logger.log(
        JSON.stringify({
          event: "domain_event",
          event_type: DomainEventType.NUMERO_INVALIDADO,
          event_id: eventId,
          round_id: null,
          actor_id: organizerId,
          draw_call_id: last.id,
        }),
      );
    });
  }

  async invalidateCall(
    organizerId: string,
    role: OrganizerRole,
    roundId: string,
    callId: string,
    reason: string,
    sellerEventIds: string[],
  ): Promise<void> {
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
    if (round.status !== RoundStatus.EM_SORTEIO) {
      throw new ApiException(
        "ROUND_NOT_IN_DRAW",
        "Round must be in EM_SORTEIO to invalidate draw calls.",
        HttpStatus.CONFLICT,
      );
    }

    await this.events.findEventForAccess(
      organizerId,
      role,
      round.eventId,
      sellerEventIds,
    );

    const session = await this.requireOpenSession(round.eventId);
    const call = await this.prisma.drawCall.findFirst({
      where: { id: callId, drawSessionId: session.id },
    });
    if (!call) {
      throw new ApiException(
        "DRAW_CALL_NOT_FOUND",
        "Draw call not found.",
        HttpStatus.NOT_FOUND,
      );
    }
    if (call.status === DrawCallStatus.invalidated) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.drawCall.update({
        where: { id: call.id },
        data: {
          status: DrawCallStatus.invalidated,
          invalidatedAt: new Date(),
          invalidationReason: reason,
        },
      });
      await tx.domainEventLog.create({
        data: {
          eventId: round.eventId,
          roundId: round.id,
          actorId: organizerId,
          actorRole: role,
          eventType: DomainEventType.NUMERO_INVALIDADO,
          payloadJson: {
            draw_session_id: session.id,
            draw_call_id: call.id,
            sequence: call.sequence,
            ball_number: call.ballNumber,
            reason,
          },
        },
      });
      this.logger.log(
        JSON.stringify({
          event: "domain_event",
          event_type: DomainEventType.NUMERO_INVALIDADO,
          event_id: round.eventId,
          round_id: round.id,
          actor_id: organizerId,
          draw_call_id: call.id,
        }),
      );
    });
  }

  async getDrawState(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<DrawStateResponse> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const session = await this.prisma.drawSession.findUnique({
      where: { eventId },
    });

    if (!session) {
      return {
        session: null,
        calls: [],
        remaining_numbers: this.fullRange(),
      };
    }

    const calls = await this.prisma.drawCall.findMany({
      where: { drawSessionId: session.id },
      orderBy: { sequence: "asc" },
    });

    const called = new Set(
      calls
        .filter((c) => c.status === DrawCallStatus.active)
        .map((c) => c.ballNumber),
    );
    const remaining = this.fullRange().filter((n) => !called.has(n));

    return {
      session: this.toSessionResponse(session),
      calls: calls.map((c) => ({
        id: c.id,
        sequence: c.sequence,
        ball_number: c.ballNumber,
        called_at: c.calledAt.toISOString(),
        status: c.status,
        invalidated_at: c.invalidatedAt?.toISOString() ?? null,
        invalidation_reason: c.invalidationReason ?? null,
      })),
      remaining_numbers: remaining,
    };
  }

  async closeSession(
    organizerId: string,
    role: OrganizerRole,
    eventId: string,
    sellerEventIds: string[],
  ): Promise<DrawSessionResponse> {
    await this.events.findEventForAccess(
      organizerId,
      role,
      eventId,
      sellerEventIds,
    );

    const session = await this.prisma.drawSession.findUnique({
      where: { eventId },
    });

    if (!session) {
      throw new ApiException(
        "DRAW_SESSION_NOT_FOUND",
        "No draw session exists for this event.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (session.status === DrawSessionStatus.closed) {
      return this.toSessionResponse(session);
    }

    const closed = await this.prisma.drawSession.update({
      where: { id: session.id },
      data: {
        status: DrawSessionStatus.closed,
        closedAt: new Date(),
      },
    });

    return this.toSessionResponse(closed);
  }

  private assertDrawableEvent(status: EventStatus): void {
    if (!canUseDrawForEvent(status)) {
      throw new ApiException(
        "EVENT_NOT_DRAWABLE",
        "The event must be scheduled or in progress to use the draw.",
        HttpStatus.CONFLICT,
      );
    }
  }

  private async requireOpenSession(eventId: string) {
    const session = await this.prisma.drawSession.findUnique({
      where: { eventId },
    });

    if (!session) {
      throw new ApiException(
        "DRAW_SESSION_NOT_FOUND",
        "Start a draw session before recording calls.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (session.status !== DrawSessionStatus.open) {
      throw new ApiException(
        "DRAW_SESSION_NOT_OPEN",
        "The draw session is closed.",
        HttpStatus.CONFLICT,
      );
    }

    return session;
  }

  private async nextSequence(drawSessionId: string): Promise<number> {
    const agg = await this.prisma.drawCall.aggregate({
      where: { drawSessionId },
      _max: { sequence: true },
    });
    return (agg._max.sequence ?? 0) + 1;
  }

  private fullRange(): number[] {
    return Array.from({ length: 75 }, (_, i) => i + 1);
  }

  private toSessionResponse(s: DrawSession): DrawSessionResponse {
    return {
      id: s.id,
      event_id: s.eventId,
      status: s.status,
      started_at: s.startedAt.toISOString(),
      closed_at: s.closedAt ? s.closedAt.toISOString() : null,
    };
  }

  private toCallResponse(c: DrawCall): DrawCallResponse {
    return {
      id: c.id,
      draw_session_id: c.drawSessionId,
      sequence: c.sequence,
      ball_number: c.ballNumber,
      called_at: c.calledAt.toISOString(),
      note: c.note,
    };
  }
}
