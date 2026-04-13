import { Injectable } from "@nestjs/common";
import { DomainEventType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type RecordDomainEventParams = {
  eventId: string;
  roundId?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  eventType: DomainEventType;
  payload: Prisma.InputJsonObject;
};

@Injectable()
export class DomainEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordDomainEventParams): Promise<void> {
    await this.prisma.domainEventLog.create({
      data: {
        eventId: params.eventId,
        roundId: params.roundId ?? null,
        actorId: params.actorId ?? null,
        actorRole: params.actorRole ?? null,
        eventType: params.eventType,
        payloadJson: params.payload,
      },
    });
  }
}
