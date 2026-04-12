import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthTokensResponseDto } from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config/env.validation';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService<AppEnv, true>);
    register(dto: RegisterDto): Promise<AuthTokensResponseDto>;
    login(dto: LoginDto): Promise<AuthTokensResponseDto>;
    private normalizeEmail;
    private buildAuthResponse;
}
