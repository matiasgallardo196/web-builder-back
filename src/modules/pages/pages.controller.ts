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
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ReorderPagesDto } from './dto/reorder-pages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('pages')
@ApiBearerAuth()
@Controller('projects/:slug/pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new page in project' })
  create(
    @Param('slug') slug: string,
    @Body() createPageDto: CreatePageDto,
    @CurrentUser() user: User,
  ) {
    return this.pagesService.create(slug, createPageDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pages of a project' })
  findAll(@Param('slug') slug: string) {
    return this.pagesService.findAllByProject(slug);
  }

  @Get(':pageId')
  @ApiOperation({ summary: 'Get page by ID' })
  findOne(@Param('pageId', ParseUUIDPipe) pageId: string) {
    return this.pagesService.findOne(pageId);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder pages in project' })
  reorder(
    @Param('slug') slug: string,
    @Body() reorderDto: ReorderPagesDto,
    @CurrentUser() user: User,
  ) {
    return this.pagesService.reorder(slug, reorderDto.pageIds, user.id);
  }

  @Patch(':pageId')
  @ApiOperation({ summary: 'Update page' })
  update(
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @Body() updatePageDto: UpdatePageDto,
    @CurrentUser() user: User,
  ) {
    return this.pagesService.update(pageId, updatePageDto, user.id);
  }

  @Delete(':pageId')
  @ApiOperation({ summary: 'Delete page' })
  remove(
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @CurrentUser() user: User,
  ) {
    return this.pagesService.remove(pageId, user.id);
  }
}
