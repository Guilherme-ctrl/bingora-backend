import { HttpStatus } from "@nestjs/common";
import { OrganizerRole, RoundStatus, SellerReconciliationStatus } from "@prisma/client";
import { RoundsService } from "./rounds.service";

describe("RoundsService", () => {
  function createService() {
    const prisma = {
      round: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      eventSeller: {
        findMany: jest.fn(),
      },
      sellerReconciliation: {
        findMany: jest.fn(),
      },
      domainEventLog: {
        create: jest.fn(),
      },
      eventRoleAssignment: {
        findMany: jest.fn(),
      },
    } as any;

    const events = {
      findEventForAccess: jest.fn(),
    } as any;

    const service = new RoundsService(prisma, events);
    return { service, prisma };
  }

  it("blocks start draw when seller reconciliation is pending", async () => {
    const { service, prisma } = createService();
    prisma.round.findUnique
      .mockResolvedValueOnce({
        id: "r1",
        eventId: "e1",
        status: RoundStatus.AGUARDANDO_CONFERENCIA,
      })
      .mockResolvedValueOnce({
        id: "r1",
        eventId: "e1",
        status: RoundStatus.AGUARDANDO_CONFERENCIA,
      });
    prisma.eventSeller.findMany.mockResolvedValue([
      { sellerOrganizerId: "s1" },
      { sellerOrganizerId: "s2" },
    ]);
    prisma.sellerReconciliation.findMany.mockResolvedValue([
      { sellerOrganizerId: "s1", status: SellerReconciliationStatus.CONFERIDO },
    ]);

    await expect(
      service.startDraw("admin-1", OrganizerRole.admin, "r1"),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: {
        error: {
          code: "ROUND_RECONCILIATION_PENDING",
        },
      },
    });
  });

  it("starts draw when all sellers are reconciled", async () => {
    const { service, prisma } = createService();
    prisma.round.findUnique
      .mockResolvedValueOnce({
        id: "r1",
        eventId: "e1",
        status: RoundStatus.AGUARDANDO_CONFERENCIA,
      })
      .mockResolvedValueOnce({
        id: "r1",
        eventId: "e1",
        status: RoundStatus.AGUARDANDO_CONFERENCIA,
      });
    prisma.eventSeller.findMany.mockResolvedValue([
      { sellerOrganizerId: "s1" },
      { sellerOrganizerId: "s2" },
    ]);
    prisma.sellerReconciliation.findMany.mockResolvedValue([
      { sellerOrganizerId: "s1", status: SellerReconciliationStatus.CONFERIDO },
      { sellerOrganizerId: "s2", status: SellerReconciliationStatus.CONFERIDO },
    ]);
    prisma.round.update.mockResolvedValue({
      id: "r1",
      eventId: "e1",
      status: RoundStatus.EM_SORTEIO,
      finishedAt: null,
    });

    const updated = await service.startDraw("admin-1", OrganizerRole.admin, "r1");
    expect(updated.status).toBe(RoundStatus.EM_SORTEIO);
    expect(prisma.round.update).toHaveBeenCalledTimes(1);
  });
});
