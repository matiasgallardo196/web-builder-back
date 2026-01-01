import { IsEnum, IsOptional, IsNumber, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComponentType } from '../entities/component.entity';

export class CreateComponentDto {
  @ApiProperty({ enum: ComponentType, example: ComponentType.TEXT })
  @IsEnum(ComponentType)
  @IsNotEmpty()
  type: ComponentType;

  @ApiPropertyOptional({ example: 100, description: 'X position in pixels' })
  @IsNumber()
  @IsOptional()
  x?: number;

  @ApiPropertyOptional({ example: 50, description: 'Y position in pixels' })
  @IsNumber()
  @IsOptional()
  y?: number;

  @ApiPropertyOptional({ example: 200, description: 'Width in pixels' })
  @IsNumber()
  @Min(10)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ example: 100, description: 'Height in pixels' })
  @IsNumber()
  @Min(10)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ 
    example: { content: 'Hello World', fontSize: 16 },
    description: 'Component-specific properties (content, src, href, etc.)' 
  })
  @IsOptional()
  props?: Record<string, unknown>;

  @ApiPropertyOptional({ 
    example: { color: '#333', backgroundColor: 'transparent' },
    description: 'CSS styles' 
  })
  @IsOptional()
  styles?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 0, description: 'Z-index for layering' })
  @IsInt()
  @Min(0)
  @IsOptional()
  zIndex?: number;
}
