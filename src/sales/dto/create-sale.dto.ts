import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class CreateSaleDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  participant_id?: string | null;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  payment_status!: PaymentStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unit_price_cents?: number | null;

  @ApiPropertyOptional({ example: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    type: [Number],
    description:
      "Números de série das cartelas neste evento. Deve ter o mesmo tamanho que quantity; cada cartela deve estar disponível. Omita para atribuir automaticamente.",
    example: [3, 7],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  serial_numbers?: number[];
}
