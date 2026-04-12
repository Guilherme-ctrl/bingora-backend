import { EventStatus } from '@prisma/client';

/** Events that may start or use a draw session (not draft / completed / cancelled). */
export function canUseDrawForEvent(status: EventStatus): boolean {
  return status === EventStatus.scheduled || status === EventStatus.in_progress;
}

export function assertBallNumberInRange(ballNumber: number): void {
  if (!Number.isInteger(ballNumber) || ballNumber < 1 || ballNumber > 75) {
    throw new Error('ball_number must be an integer from 1 to 75');
  }
}
