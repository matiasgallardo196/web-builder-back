import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('sections')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post('pages/:pageId/sections')
  @ApiOperation({ summary: 'Create a new section in page' })
  create(
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @Body() createSectionDto: CreateSectionDto,
    @CurrentUser() user: User,
  ) {
    return this.sectionsService.create(pageId, createSectionDto, user.id);
  }

  @Get('pages/:pageId/sections')
  @ApiOperation({ summary: 'Get all sections of a page' })
  findAll(@Param('pageId', ParseUUIDPipe) pageId: string) {
    return this.sectionsService.findAllByPage(pageId);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'Get section by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch('sections/:id')
  @ApiOperation({ summary: 'Update section' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser() user: User,
  ) {
    return this.sectionsService.update(id, updateSectionDto, user.id);
  }

  @Delete('sections/:id')
  @ApiOperation({ summary: 'Delete section' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.sectionsService.remove(id, user.id);
  }
}
