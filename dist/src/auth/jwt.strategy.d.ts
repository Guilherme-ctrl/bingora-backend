import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { OrganizerRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AppEnv } from '../config/env.validation';
export type JwtPayload = {
    sub: string;
    email: string;
    role: OrganizerRole;
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(config: ConfigService<AppEnv, true>, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        organizerId: string;
        email: string;
        role: import("@prisma/client").$Enums.OrganizerRole;
        sellerEventIds: string[];
    }>;
}
export {};
