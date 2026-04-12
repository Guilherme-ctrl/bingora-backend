import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

export class AddEventSellerDto {
  @ApiProperty({ example: "vendedor@example.com" })
  @IsEmail()
  email!: string;

  /** Obrigatório se o e-mail ainda não tiver conta. Mín. 8 caracteres. */
  @ApiPropertyOptional({ minLength: 8 })
  @ValidateIf((_o, v) => v !== undefined && v !== null && String(v).length > 0)
  @IsString()
  @MinLength(8)
  password?: string;
}
