import { IsArray, ValidateNested, IsUUID, IsNumber, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BatchUpdateItem {
  @ApiProperty({ description: 'Component ID' })
  @IsUUID()
  id: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  x?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  y?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(10)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(10)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  zIndex?: number;
}

export class BatchUpdateComponentsDto {
  @ApiProperty({ type: [BatchUpdateItem], description: 'Array of component updates' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateItem)
  components: BatchUpdateItem[];
}
