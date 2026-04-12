import { EventStatus } from "@prisma/client";
import { ApiException } from "../common/exceptions/api.exception";
import { HttpStatus } from "@nestjs/common";

const ALLOWED_ON_CREATE: EventStatus[] = [
  EventStatus.draft,
  EventStatus.scheduled,
];

export function assertAllowedCreateStatus(
  status: EventStatus | undefined,
): void {
  if (status === undefined) {
    return;
  }
  if (!ALLOWED_ON_CREATE.includes(status)) {
    throw new ApiException(
      "INVALID_EVENT_STATUS",
      "New events may only be created as draft or scheduled.",
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export function isEventLocked(status: EventStatus): boolean {
  return status === EventStatus.completed || status === EventStatus.cancelled;
}

/** Allowed single-step transitions (FR-EVT-4). Same → same is always allowed. */
export function assertValidStatusTransition(
  from: EventStatus,
  to: EventStatus,
): void {
  if (from === to) {
    return;
  }

  const allowed: Record<EventStatus, EventStatus[]> = {
    [EventStatus.draft]: [EventStatus.scheduled, EventStatus.cancelled],
    [EventStatus.scheduled]: [EventStatus.in_progress, EventStatus.cancelled],
    [EventStatus.in_progress]: [EventStatus.completed],
    [EventStatus.completed]: [],
    [EventStatus.cancelled]: [],
  };

  if (!allowed[from].includes(to)) {
    throw new ApiException(
      "INVALID_STATUS_TRANSITION",
      `Cannot change event status from "${from}" to "${to}".`,
      HttpStatus.CONFLICT,
    );
  }
}
