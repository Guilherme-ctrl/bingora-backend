import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap-app";
import type { AppEnv } from "../src/config/env.validation";
import { PrismaService } from "../src/prisma/prisma.service";

/**
 * Uses a lightweight Prisma mock so the suite runs without Docker/Postgres.
 * For a full DB check, run the app with `docker compose up` and hit GET /health.
 */
describe("Health (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: () => Promise.resolve(),
        onModuleDestroy: () => Promise.resolve(),
        $connect: () => Promise.resolve(),
        $disconnect: () => Promise.resolve(),
        $queryRaw: () => Promise.resolve([{ ok: 1 }]),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    const config = app.get(ConfigService<AppEnv, true>);
    configureApp(app, config);
    await app.init();
  });

  it("GET /health returns ok when database is reachable", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect((res) => {
        const body = res.body as { status: string; database: string };
        expect(body.status).toBe("ok");
        expect(body.database).toBe("up");
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
