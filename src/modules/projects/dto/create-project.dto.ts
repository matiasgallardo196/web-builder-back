import { IsNotEmpty, IsString, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Awesome Website' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'my-awesome-website', description: 'URL-friendly slug (lowercase, hyphens only)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only (e.g., my-project-name)',
  })
  slug: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: { theme: 'dark', primaryColor: '#3498db' } })
  @IsOptional()
  settings?: Record<string, unknown>;
}
