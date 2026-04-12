"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
let OrganizersService = class OrganizersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(organizerId) {
        const organizer = await this.prisma.organizer.findUnique({
            where: { id: organizerId },
        });
        if (!organizer) {
            throw new api_exception_1.ApiException('ORGANIZER_NOT_FOUND', 'Organizer not found.', common_1.HttpStatus.NOT_FOUND);
        }
        const base = {
            id: organizer.id,
            email: organizer.email,
            role: organizer.role,
            created_at: organizer.createdAt.toISOString(),
        };
        if (organizer.role === client_1.OrganizerRole.seller) {
            const links = await this.prisma.eventSeller.findMany({
                where: { sellerOrganizerId: organizer.id },
                select: { eventId: true },
            });
            return {
                ...base,
                seller_event_ids: links.map((l) => l.eventId),
            };
        }
        return base;
    }
};
exports.OrganizersService = OrganizersService;
exports.OrganizersService = OrganizersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizersService);
//# sourceMappingURL=organizers.service.js.map