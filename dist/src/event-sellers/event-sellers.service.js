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
exports.EventSellersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const events_service_1 = require("../events/events.service");
const BCRYPT_ROUNDS = 12;
let EventSellersService = class EventSellersService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    async listForEvent(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        if (role === client_1.OrganizerRole.seller) {
            throw new api_exception_1.ApiException('FORBIDDEN', 'Forbidden.', common_1.HttpStatus.FORBIDDEN);
        }
        const rows = await this.prisma.eventSeller.findMany({
            where: { eventId },
            include: { seller: { select: { email: true } } },
            orderBy: { createdAt: 'asc' },
        });
        return {
            items: rows.map((r) => ({
                seller_organizer_id: r.sellerOrganizerId,
                email: r.seller.email,
                created_at: r.createdAt.toISOString(),
            })),
        };
    }
    async addToEvent(organizerId, role, eventId, dto, sellerEventIds) {
        const event = await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        if (role === client_1.OrganizerRole.seller) {
            throw new api_exception_1.ApiException('FORBIDDEN', 'Forbidden.', common_1.HttpStatus.FORBIDDEN);
        }
        if (role !== client_1.OrganizerRole.admin && event.organizerId !== organizerId) {
            throw new api_exception_1.ApiException('FORBIDDEN', 'Forbidden.', common_1.HttpStatus.FORBIDDEN);
        }
        const email = this.normalizeEmail(dto.email);
        const existing = await this.prisma.organizer.findUnique({
            where: { email },
        });
        let sellerOrganizerId;
        if (!existing) {
            if (!dto.password || dto.password.length < 8) {
                throw new api_exception_1.ApiException('PASSWORD_REQUIRED', 'Password is required (min 8 characters) when creating a new seller account.', common_1.HttpStatus.BAD_REQUEST);
            }
            const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
            try {
                const created = await this.prisma.organizer.create({
                    data: {
                        email,
                        passwordHash,
                        role: client_1.OrganizerRole.seller,
                    },
                });
                sellerOrganizerId = created.id;
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    e.code === 'P2002') {
                    throw new api_exception_1.ApiException('EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.', common_1.HttpStatus.CONFLICT);
                }
                throw e;
            }
        }
        else {
            if (existing.role !== client_1.OrganizerRole.seller) {
                throw new api_exception_1.ApiException('ORGANIZER_NOT_SELLER', 'This email belongs to an account that is not a seller. Use a different email.', common_1.HttpStatus.CONFLICT);
            }
            sellerOrganizerId = existing.id;
        }
        try {
            const link = await this.prisma.eventSeller.create({
                data: {
                    eventId,
                    sellerOrganizerId,
                },
                include: { seller: { select: { email: true } } },
            });
            return {
                seller_organizer_id: link.sellerOrganizerId,
                email: link.seller.email,
                created_at: link.createdAt.toISOString(),
            };
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                throw new api_exception_1.ApiException('SELLER_ALREADY_LINKED', 'This seller is already assigned to this event.', common_1.HttpStatus.CONFLICT);
            }
            throw e;
        }
    }
    async removeFromEvent(organizerId, role, eventId, sellerOrganizerId, sellerEventIds) {
        const event = await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        if (role === client_1.OrganizerRole.seller) {
            throw new api_exception_1.ApiException('FORBIDDEN', 'Forbidden.', common_1.HttpStatus.FORBIDDEN);
        }
        if (role !== client_1.OrganizerRole.admin && event.organizerId !== organizerId) {
            throw new api_exception_1.ApiException('FORBIDDEN', 'Forbidden.', common_1.HttpStatus.FORBIDDEN);
        }
        const res = await this.prisma.eventSeller.deleteMany({
            where: { eventId, sellerOrganizerId },
        });
        if (res.count === 0) {
            throw new api_exception_1.ApiException('EVENT_SELLER_NOT_FOUND', 'Seller assignment not found for this event.', common_1.HttpStatus.NOT_FOUND);
        }
    }
};
exports.EventSellersService = EventSellersService;
exports.EventSellersService = EventSellersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], EventSellersService);
//# sourceMappingURL=event-sellers.service.js.map