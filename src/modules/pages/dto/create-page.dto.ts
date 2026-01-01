import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'Home' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '/', description: 'URL path for the page' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\/[a-z0-9\-\/]*$/, {
    message: 'Path must start with / and contain only lowercase letters, numbers, hyphens, and slashes',
  })
  path: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isHome?: boolean;
}
