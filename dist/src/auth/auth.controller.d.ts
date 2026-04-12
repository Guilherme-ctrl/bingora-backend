import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokensResponseDto } from './dto/auth-response.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<AuthTokensResponseDto>;
    login(dto: LoginDto): Promise<AuthTokensResponseDto>;
    logout(): void;
}
