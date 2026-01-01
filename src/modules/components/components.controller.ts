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
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { BatchUpdateComponentsDto } from './dto/batch-update-components.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('components')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post('sections/:sectionId/components')
  @ApiOperation({ summary: 'Create a new component in section' })
  create(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() createComponentDto: CreateComponentDto,
    @CurrentUser() user: User,
  ) {
    return this.componentsService.create(sectionId, createComponentDto, user.id);
  }

  @Get('sections/:sectionId/components')
  @ApiOperation({ summary: 'Get all components of a section' })
  findAll(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.componentsService.findAllBySection(sectionId);
  }

  @Get('components/:id')
  @ApiOperation({ summary: 'Get component by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.componentsService.findOne(id);
  }

  @Patch('components/batch')
  @ApiOperation({ summary: 'Batch update multiple components (for drag & drop)' })
  batchUpdate(
    @Body() batchUpdateDto: BatchUpdateComponentsDto,
    @CurrentUser() user: User,
  ) {
    return this.componentsService.batchUpdate(batchUpdateDto, user.id);
  }

  @Patch('components/:id')
  @ApiOperation({ summary: 'Update component' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateComponentDto: UpdateComponentDto,
    @CurrentUser() user: User,
  ) {
    return this.componentsService.update(id, updateComponentDto, user.id);
  }

  @Delete('components/:id')
  @ApiOperation({ summary: 'Delete component' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.componentsService.remove(id, user.id);
  }
}
