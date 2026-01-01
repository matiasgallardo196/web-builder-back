import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsInt()
  @Min(50)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ example: { backgroundColor: '#f0f0f0' } })
  @IsOptional()
  styles?: Record<string, unknown>;
}
