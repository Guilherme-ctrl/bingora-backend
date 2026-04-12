import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Friday Night Bingo' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: '2026-04-15T23:00:00.000Z' })
  @IsDateString()
  starts_at!: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  @MinLength(1)
  timezone!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Hall A' })
  @IsOptional()
  @IsString()
  venue_notes?: string | null;

  @ApiPropertyOptional({ enum: EventStatus, default: EventStatus.draft })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Preço padrão da cartela em centavos (ex.: 500 = R$ 5,00).',
    example: 500,
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  default_unit_price_cents?: number | null;

  @ApiPropertyOptional({
    example: 'BRL',
    description: 'Código ISO 4217 para o preço padrão da cartela.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  default_currency?: string;
}
