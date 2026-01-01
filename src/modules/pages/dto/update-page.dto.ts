import { IsString, IsOptional, IsBoolean, IsInt, Min, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePageDto {
  @ApiPropertyOptional({ example: 'About Us' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '/about' })
  @IsString()
  @IsOptional()
  @Matches(/^\/[a-z0-9\-\/]*$/, {
    message: 'Path must start with / and contain only lowercase letters, numbers, hyphens, and slashes',
  })
  path?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isHome?: boolean;
}
