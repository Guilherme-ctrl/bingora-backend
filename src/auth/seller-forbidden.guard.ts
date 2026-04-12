import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrganizerRole } from '@prisma/client';
import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';

/** Bloqueia contas com papel `seller` (só vendas nos eventos designados). */
@Injectable()
export class SellerForbiddenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ user: CurrentOrganizerPayload }>();
    if (req.user?.role === OrganizerRole.seller) {
      throw new ForbiddenException(
        'Sellers may only manage sales and participants for assigned events.',
      );
    }
    return true;
  }
}
