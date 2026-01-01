import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'My Updated Website' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'my-updated-website' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only',
  })
  slug?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: { theme: 'light' } })
  @IsOptional()
  settings?: Record<string, unknown>;
}
