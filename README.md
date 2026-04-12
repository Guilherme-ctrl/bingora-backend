# Bingo API (NestJS)

MVP backend for the bingo event platform. API base path: `/api/v1`. OpenAPI UI: `/api/docs`.

## Prerequisites

- Node.js 20+ (project targets LTS; other versions may work)
- Docker with Docker Compose (for local PostgreSQL)
- npm

## Local setup

1. **Start PostgreSQL**

   From the repository root (parent of `backend/`):

   ```bash
   docker compose up -d
   ```

2. **Configure environment**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env` if your database URL differs. Defaults match `docker-compose.yml` (`bingo` / `bingo` / `bingo`).

3. **Install dependencies and apply migrations**

   ```bash
   npm install
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Run the API**

   ```bash
   npm run start:dev
   ```

   - Health (no auth): [http://localhost:3000/health](http://localhost:3000/health)
   - Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests (needs DB) |
| `npm run prisma:migrate` | Create/apply migrations (dev) |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:studio` | Prisma Studio |

## Specification

Product and API behavior are defined in `/Docs` (especially `06-api-contract.md` and `05-domain-model.md`).

## Slices implemented

- **Slice 1:** NestJS app, Prisma, Docker Compose, env, Swagger, lint/format, this README.
- **Slice 2:** Full Prisma schema + initial migration, organizer registration, login, JWT, `GET /api/v1/me`, `POST /api/v1/auth/logout` (stateless JWT; client discards token).
- **Slice 3:** Events CRUD (list with pagination/sort, create, get, patch with status transitions) and prizes (list/create under an event, patch/delete by prize id). All scoped to the authenticated organizer; completed/cancelled events are locked; prize delete is blocked when any winner row references the prize (DB FK).
- **Slice 4:** Bingo cards — `POST .../cards/generate` (ruleset `us_75_ball_5x5` only, max 10k per request, blocked if any card already exists for the event), paginated `GET .../cards` with optional `status` (e.g. `available`) and `serial_number`, `GET .../cards/export?format=json|csv` for print/tooling pipelines. Grids are US 75-ball with column ranges and free center; uniqueness enforced via SHA-256 fingerprint per event.
- **Slice 5:** Participants (CRUD under an event + `PATCH`/`DELETE` by id) and sales (`POST`/`GET` under event, `GET`/`PATCH`/`POST .../void` on `/sales/:id`). Sales assign the lowest available serials in a **serializable** transaction; void deletes `SaleCard` rows and sets cards back to **available**. Creating sales or mutating participants is blocked when the event is **completed/cancelled**; void is blocked in that state; `PATCH` sale is blocked only if the sale is **voided**.
- **Slice 6:** Draw — `POST .../draw/session` (**201** when created, **200** when an open session already exists), `POST .../draw/calls` (duplicate ball **409** via unique constraint), `DELETE .../draw/calls/last`, `GET .../draw` (includes `remaining_numbers` 1–75), `POST .../draw/close`. New sessions only when the event is **scheduled** or **in_progress**; a **closed** session cannot be reopened (MVP). Winners — `GET/POST .../events/:id/winners`, `POST /winners/:id/revoke` (body `reason` accepted, not stored); **409** if an active winner already exists for the prize. Revoking a winner is blocked when the event is **completed/cancelled** (same lock pattern as other write APIs).

- **Slice 7 (quality):** Stricter **validation** responses (`details.messages` only, no raw class-validator object spread), **implicit conversion** for query/body numbers, expanded **Swagger** description (auth + error shape), **@nestjs/swagger** compiler plugin for DTO metadata. **Tests:** batch card fingerprint uniqueness, Prisma **P2002** helper used by draw duplicate prevention, exception filter normalization. Run `npm run test:cov` for coverage.

