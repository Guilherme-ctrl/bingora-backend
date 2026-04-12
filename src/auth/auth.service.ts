import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OrganizerRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import { jwtExpiresInSeconds } from './jwt-expires';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthTokensResponseDto } from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config/env.validation';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponseDto> {
    const email = this.normalizeEmail(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const organizer = await this.prisma.organizer.create({
        data: { email, passwordHash },
      });
      return this.buildAuthResponse(
        organizer.id,
        organizer.email,
        organizer.role,
        organizer.createdAt,
      );
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ApiException(
          'EMAIL_ALREADY_REGISTERED',
          'An account with this email already exists.',
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }
  }

  async login(dto: LoginDto): Promise<AuthTokensResponseDto> {
    const email = this.normalizeEmail(dto.email);
    const organizer = await this.prisma.organizer.findUnique({
      where: { email },
    });
    if (!organizer) {
      throw new ApiException(
        'INVALID_CREDENTIALS',
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const ok = await bcrypt.compare(dto.password, organizer.passwordHash);
    if (!ok) {
      throw new ApiException(
        'INVALID_CREDENTIALS',
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.buildAuthResponse(
      organizer.id,
      organizer.email,
      organizer.role,
      organizer.createdAt,
    );
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private buildAuthResponse(
    organizerId: string,
    email: string,
    role: OrganizerRole,
    createdAt: Date,
  ): AuthTokensResponseDto {
    const expiresIn = jwtExpiresInSeconds(
      this.config.get('JWT_EXPIRES_IN', { infer: true }),
    );
    const access_token = this.jwt.sign({ sub: organizerId, email, role });
    return {
      organizer: {
        id: organizerId,
        email,
        role,
        created_at: createdAt.toISOString(),
      },
      access_token,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }
}
