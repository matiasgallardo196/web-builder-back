import { Controller, Post, Param, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('export')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post(':slug/export')
  @ApiOperation({ summary: 'Export project as Next.js ZIP file (verified users only)' })
  @ApiProduces('application/zip')
  async exportProject(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.exportService.exportProject(slug, user);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }
}
