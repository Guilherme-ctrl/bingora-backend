import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PostCallDto {
  @ApiProperty({ example: 42, minimum: 1, maximum: 75 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(75)
  ball_number!: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string | null;
}
