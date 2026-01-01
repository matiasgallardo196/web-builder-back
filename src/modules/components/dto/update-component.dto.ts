import { IsEnum, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ComponentType } from '../entities/component.entity';

export class UpdateComponentDto {
  @ApiPropertyOptional({ enum: ComponentType })
  @IsEnum(ComponentType)
  @IsOptional()
  type?: ComponentType;

  @ApiPropertyOptional({ example: 150 })
  @IsNumber()
  @IsOptional()
  x?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  y?: number;

  @ApiPropertyOptional({ example: 250 })
  @IsNumber()
  @Min(10)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsNumber()
  @Min(10)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ example: { content: 'Updated text' } })
  @IsOptional()
  props?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { color: '#000' } })
  @IsOptional()
  styles?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  zIndex?: number;
}
