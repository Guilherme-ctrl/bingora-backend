import { ApiPropertyOptional } from "@nestjs/swagger";
import { BingoCardStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListCardsQueryDto {
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

  @ApiPropertyOptional({
    enum: BingoCardStatus,
    description: "Filter by status (e.g. available)",
  })
  @IsOptional()
  @IsEnum(BingoCardStatus)
  status?: BingoCardStatus;

  @ApiPropertyOptional({ description: "Exact serial number" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serial_number?: number;
}
