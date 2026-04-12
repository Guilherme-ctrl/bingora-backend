import { ApiPropertyOptional } from "@nestjs/swagger";
import { EventStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListEventsQueryDto {
  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ enum: ["starts_at", "created_at"] })
  @IsOptional()
  @IsIn(["starts_at", "created_at"])
  sort: "starts_at" | "created_at" = "starts_at";

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "desc";

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 25, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size = 25;
}
