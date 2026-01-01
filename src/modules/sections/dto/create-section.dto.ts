import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: 400, description: 'Height in pixels' })
  @IsInt()
  @Min(50)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ example: { backgroundColor: '#ffffff' } })
  @IsOptional()
  styles?: Record<string, unknown>;
}
