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
exports.DrawService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const api_exception_1 = require("../common/exceptions/api.exception");
const events_service_1 = require("../events/events.service");
const unique_violation_1 = require("../common/prisma/unique-violation");
const draw_policy_1 = require("./draw.policy");
let DrawService = class DrawService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async ensureSession(organizerId, role, eventId, sellerEventIds) {
        const event = await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const existing = await this.prisma.drawSession.findUnique({
            where: { eventId },
        });
        if (existing) {
            if (existing.status === client_1.DrawSessionStatus.closed) {
                throw new api_exception_1.ApiException('DRAW_SESSION_CLOSED', 'The draw session for this event is already closed.', common_1.HttpStatus.CONFLICT);
            }
            return { session: this.toSessionResponse(existing), created: false };
        }
        this.assertDrawableEvent(event.status);
        const created = await this.prisma.drawSession.create({
            data: { eventId, status: client_1.DrawSessionStatus.open },
        });
        return { session: this.toSessionResponse(created), created: true };
    }
    async postCall(organizerId, role, eventId, dto, sellerEventIds) {
        try {
            (0, draw_policy_1.assertBallNumberInRange)(dto.ball_number);
        }
        catch {
            throw new api_exception_1.ApiException('INVALID_BALL_NUMBER', 'ball_number must be an integer from 1 to 75.', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const session = await this.requireOpenSession(eventId);
        try {
            const nextSequence = await this.nextSequence(session.id);
            const call = await this.prisma.drawCall.create({
                data: {
                    drawSessionId: session.id,
                    sequence: nextSequence,
                    ballNumber: dto.ball_number,
                    note: dto.note ?? null,
                },
            });
            return this.toCallResponse(call);
        }
        catch (e) {
            if ((0, unique_violation_1.isPrismaUniqueViolation)(e)) {
                throw new api_exception_1.ApiException('DUPLICATE_BALL', 'This ball number has already been called in this session.', common_1.HttpStatus.CONFLICT);
            }
            throw e;
        }
    }
    async deleteLastCall(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const session = await this.prisma.drawSession.findUnique({
            where: { eventId },
        });
        if (!session || session.status !== client_1.DrawSessionStatus.open) {
            throw new api_exception_1.ApiException('DRAW_SESSION_NOT_OPEN', 'No open draw session for this event.', common_1.HttpStatus.NOT_FOUND);
        }
        const last = await this.prisma.drawCall.findFirst({
            where: { drawSessionId: session.id },
            orderBy: { sequence: 'desc' },
        });
        if (!last) {
            throw new api_exception_1.ApiException('NO_CALLS', 'There are no calls to remove.', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.drawCall.delete({ where: { id: last.id } });
    }
    async getDrawState(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const session = await this.prisma.drawSession.findUnique({
            where: { eventId },
        });
        if (!session) {
            return {
                session: null,
                calls: [],
                remaining_numbers: this.fullRange(),
            };
        }
        const calls = await this.prisma.drawCall.findMany({
            where: { drawSessionId: session.id },
            orderBy: { sequence: 'asc' },
        });
        const called = new Set(calls.map((c) => c.ballNumber));
        const remaining = this.fullRange().filter((n) => !called.has(n));
        return {
            session: this.toSessionResponse(session),
            calls: calls.map((c) => ({
                sequence: c.sequence,
                ball_number: c.ballNumber,
                called_at: c.calledAt.toISOString(),
            })),
            remaining_numbers: remaining,
        };
    }
    async closeSession(organizerId, role, eventId, sellerEventIds) {
        await this.events.findEventForAccess(organizerId, role, eventId, sellerEventIds);
        const session = await this.prisma.drawSession.findUnique({
            where: { eventId },
        });
        if (!session) {
            throw new api_exception_1.ApiException('DRAW_SESSION_NOT_FOUND', 'No draw session exists for this event.', common_1.HttpStatus.NOT_FOUND);
        }
        if (session.status === client_1.DrawSessionStatus.closed) {
            return this.toSessionResponse(session);
        }
        const closed = await this.prisma.drawSession.update({
            where: { id: session.id },
            data: {
                status: client_1.DrawSessionStatus.closed,
                closedAt: new Date(),
            },
        });
        return this.toSessionResponse(closed);
    }
    assertDrawableEvent(status) {
        if (!(0, draw_policy_1.canUseDrawForEvent)(status)) {
            throw new api_exception_1.ApiException('EVENT_NOT_DRAWABLE', 'The event must be scheduled or in progress to use the draw.', common_1.HttpStatus.CONFLICT);
        }
    }
    async requireOpenSession(eventId) {
        const session = await this.prisma.drawSession.findUnique({
            where: { eventId },
        });
        if (!session) {
            throw new api_exception_1.ApiException('DRAW_SESSION_NOT_FOUND', 'Start a draw session before recording calls.', common_1.HttpStatus.NOT_FOUND);
        }
        if (session.status !== client_1.DrawSessionStatus.open) {
            throw new api_exception_1.ApiException('DRAW_SESSION_NOT_OPEN', 'The draw session is closed.', common_1.HttpStatus.CONFLICT);
        }
        return session;
    }
    async nextSequence(drawSessionId) {
        const agg = await this.prisma.drawCall.aggregate({
            where: { drawSessionId },
            _max: { sequence: true },
        });
        return (agg._max.sequence ?? 0) + 1;
    }
    fullRange() {
        return Array.from({ length: 75 }, (_, i) => i + 1);
    }
    toSessionResponse(s) {
        return {
            id: s.id,
            event_id: s.eventId,
            status: s.status,
            started_at: s.startedAt.toISOString(),
            closed_at: s.closedAt ? s.closedAt.toISOString() : null,
        };
    }
    toCallResponse(c) {
        return {
            id: c.id,
            draw_session_id: c.drawSessionId,
            sequence: c.sequence,
            ball_number: c.ballNumber,
            called_at: c.calledAt.toISOString(),
            note: c.note,
        };
    }
};
exports.DrawService = DrawService;
exports.DrawService = DrawService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], DrawService);
//# sourceMappingURL=draw.service.js.map