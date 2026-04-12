import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { OrganizerRole } from '@prisma/client';

export type CurrentOrganizerPayload = {
  organizerId: string;
  email: string;
  role: OrganizerRole;
  /** Preenchido para `seller`: ids de eventos em que pode operar. */
  sellerEventIds: string[];
};

export const CurrentOrganizer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentOrganizerPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: CurrentOrganizerPayload }>();
    return request.user;
  },
);
