"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const jwt_expires_1 = require("./jwt-expires");
const config_1 = require("@nestjs/config");
const BCRYPT_ROUNDS = 12;
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const email = this.normalizeEmail(dto.email);
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        try {
            const organizer = await this.prisma.organizer.create({
                data: { email, passwordHash },
            });
            return this.buildAuthResponse(organizer.id, organizer.email, organizer.role, organizer.createdAt);
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                throw new api_exception_1.ApiException('EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.', common_1.HttpStatus.CONFLICT);
            }
            throw e;
        }
    }
    async login(dto) {
        const email = this.normalizeEmail(dto.email);
        const organizer = await this.prisma.organizer.findUnique({
            where: { email },
        });
        if (!organizer) {
            throw new api_exception_1.ApiException('INVALID_CREDENTIALS', 'Invalid email or password.', common_1.HttpStatus.UNAUTHORIZED);
        }
        const ok = await bcrypt.compare(dto.password, organizer.passwordHash);
        if (!ok) {
            throw new api_exception_1.ApiException('INVALID_CREDENTIALS', 'Invalid email or password.', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.buildAuthResponse(organizer.id, organizer.email, organizer.role, organizer.createdAt);
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    buildAuthResponse(organizerId, email, role, createdAt) {
        const expiresIn = (0, jwt_expires_1.jwtExpiresInSeconds)(this.config.get('JWT_EXPIRES_IN', { infer: true }));
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map