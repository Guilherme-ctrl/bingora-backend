import { EventStatus } from '@prisma/client';
import { ApiException } from '../common/exceptions/api.exception';
import {
  assertAllowedCreateStatus,
  assertValidStatusTransition,
  isEventLocked,
} from './event-status.policy';

describe('event-status.policy', () => {
  it('allows draft -> scheduled and draft -> cancelled', () => {
    expect(() =>
      assertValidStatusTransition(EventStatus.draft, EventStatus.scheduled),
    ).not.toThrow();
    expect(() =>
      assertValidStatusTransition(EventStatus.draft, EventStatus.cancelled),
    ).not.toThrow();
  });

  it('allows scheduled -> in_progress', () => {
    expect(() =>
      assertValidStatusTransition(
        EventStatus.scheduled,
        EventStatus.in_progress,
      ),
    ).not.toThrow();
  });

  it('allows in_progress -> completed', () => {
    expect(() =>
      assertValidStatusTransition(
        EventStatus.in_progress,
        EventStatus.completed,
      ),
    ).not.toThrow();
  });

  it('rejects draft -> completed', () => {
    expect(() =>
      assertValidStatusTransition(EventStatus.draft, EventStatus.completed),
    ).toThrow(ApiException);
  });

  it('rejects in_progress -> cancelled', () => {
    expect(() =>
      assertValidStatusTransition(
        EventStatus.in_progress,
        EventStatus.cancelled,
      ),
    ).toThrow(ApiException);
  });

  it('treats completed and cancelled as locked', () => {
    expect(isEventLocked(EventStatus.completed)).toBe(true);
    expect(isEventLocked(EventStatus.cancelled)).toBe(true);
    expect(isEventLocked(EventStatus.draft)).toBe(false);
  });

  it('allows only draft or scheduled on create', () => {
    expect(() => assertAllowedCreateStatus(EventStatus.draft)).not.toThrow();
    expect(() =>
      assertAllowedCreateStatus(EventStatus.scheduled),
    ).not.toThrow();
    expect(() => assertAllowedCreateStatus(EventStatus.in_progress)).toThrow(
      ApiException,
    );
  });
});
