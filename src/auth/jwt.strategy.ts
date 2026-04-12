import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { OrganizerRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AppEnv } from "../config/env.validation";

export type JwtPayload = { sub: string; email: string; role: OrganizerRole };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService<AppEnv, true>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECRET", { infer: true }),
    });
  }

  async validate(payload: JwtPayload) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { id: payload.sub },
    });
    if (!organizer) {
      throw new UnauthorizedException();
    }
    const sellerEventIds =
      organizer.role === OrganizerRole.seller
        ? (
            await this.prisma.eventSeller.findMany({
              where: { sellerOrganizerId: organizer.id },
              select: { eventId: true },
            })
          ).map((l) => l.eventId)
        : [];
    return {
      organizerId: organizer.id,
      email: organizer.email,
      role: organizer.role,
      sellerEventIds,
    };
  }
}
