import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Equals, IsInt, Max, Min } from 'class-validator';

export const US_75_BALL_5X5 = 'us_75_ball_5x5' as const;

export class GenerateCardsDto {
  @ApiProperty({ example: 100, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  count!: number;

  @ApiProperty({ example: US_75_BALL_5X5 })
  @Equals(US_75_BALL_5X5)
  ruleset!: typeof US_75_BALL_5X5;
}
