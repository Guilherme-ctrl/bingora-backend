import { ApiProperty } from "@nestjs/swagger";
import { RoundType } from "@prisma/client";
import { IsEnum, IsString, MaxLength } from "class-validator";

export class CreateRoundDto {
  @ApiProperty({ example: "R1" })
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty({ enum: RoundType })
  @IsEnum(RoundType)
  type!: RoundType;
}
