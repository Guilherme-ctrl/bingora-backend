import { EventStatus } from '@prisma/client';
export declare function assertAllowedCreateStatus(status: EventStatus | undefined): void;
export declare function isEventLocked(status: EventStatus): boolean;
export declare function assertValidStatusTransition(from: EventStatus, to: EventStatus): void;
