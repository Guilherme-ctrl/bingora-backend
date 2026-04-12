import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthTokensResponseDto } from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new organizer" })
  async register(@Body() dto: RegisterDto): Promise<AuthTokensResponseDto> {
    return this.auth.register(dto);
  }

  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in" })
  async login(@Body() dto: LoginDto): Promise<AuthTokensResponseDto> {
    return this.auth.login(dto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Log out",
    description:
      "Returns 204. Tokens are stateless JWTs; clients should discard the token. No server-side invalidation in MVP.",
  })
  logout(): void {
    return;
  }
}
