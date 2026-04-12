import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: "Liveness and database connectivity" })
  async health(): Promise<{ status: string; database: string }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", database: "up" };
  }
}
