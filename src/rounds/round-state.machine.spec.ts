import { RoundStatus } from "@prisma/client";
import { canTransitionRound } from "./round-state.machine";

describe("round-state.machine", () => {
  it("allows valid transitions", () => {
    expect(canTransitionRound(RoundStatus.CRIADA, RoundStatus.EM_VENDA)).toBe(
      true,
    );
    expect(
      canTransitionRound(
        RoundStatus.EM_VENDA,
        RoundStatus.AGUARDANDO_CONFERENCIA,
      ),
    ).toBe(true);
    expect(
      canTransitionRound(
        RoundStatus.AGUARDANDO_CONFERENCIA,
        RoundStatus.EM_SORTEIO,
      ),
    ).toBe(true);
    expect(
      canTransitionRound(RoundStatus.EM_SORTEIO, RoundStatus.FINALIZADA),
    ).toBe(true);
  });

  it("blocks invalid transitions", () => {
    expect(
      canTransitionRound(
        RoundStatus.CRIADA,
        RoundStatus.AGUARDANDO_CONFERENCIA,
      ),
    ).toBe(false);
    expect(
      canTransitionRound(RoundStatus.EM_VENDA, RoundStatus.FINALIZADA),
    ).toBe(false);
    expect(
      canTransitionRound(RoundStatus.FINALIZADA, RoundStatus.EM_SORTEIO),
    ).toBe(false);
  });
});
