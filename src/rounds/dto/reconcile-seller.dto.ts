import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SellerReconciliationStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class ReconcileSellerDto {
  @ApiProperty({ enum: SellerReconciliationStatus })
  @IsEnum(SellerReconciliationStatus)
  status!: SellerReconciliationStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  justification?: string | null;
}
