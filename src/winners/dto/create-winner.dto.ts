import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";

export class CreateWinnerDto {
  @ApiProperty()
  @IsUUID()
  prize_id!: string;

  @ApiProperty()
  @IsUUID()
  participant_id!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUUID()
  bingo_card_id?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
