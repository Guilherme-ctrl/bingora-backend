import { RoundStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Record<RoundStatus, RoundStatus[]> = {
  [RoundStatus.CRIADA]: [RoundStatus.EM_VENDA],
  [RoundStatus.EM_VENDA]: [RoundStatus.AGUARDANDO_CONFERENCIA],
  [RoundStatus.AGUARDANDO_CONFERENCIA]: [RoundStatus.EM_SORTEIO],
  [RoundStatus.EM_SORTEIO]: [RoundStatus.FINALIZADA],
  [RoundStatus.FINALIZADA]: [],
};

export function canTransitionRound(
  from: RoundStatus,
  to: RoundStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
