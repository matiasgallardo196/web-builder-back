import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Component } from './entities/component.entity';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { BatchUpdateComponentsDto } from './dto/batch-update-components.dto';
import { SectionsService } from '../sections/sections.service';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectRepository(Component)
    private readonly componentsRepository: Repository<Component>,
    private readonly sectionsService: SectionsService,
  ) {}

  async create(sectionId: string, createComponentDto: CreateComponentDto, userId: string): Promise<Component> {
    const section = await this.sectionsService.findOne(sectionId);

    if (section.page.project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to add components to this section');
    }

    const component = this.componentsRepository.create({
      ...createComponentDto,
      sectionId,
    });

    return this.componentsRepository.save(component);
  }

  async findAllBySection(sectionId: string): Promise<Component[]> {
    return this.componentsRepository.find({
      where: { sectionId },
      order: { zIndex: 'ASC' },
    });
  }

  async findOne(componentId: string): Promise<Component> {
    const component = await this.componentsRepository.findOne({
      where: { id: componentId },
      relations: ['section', 'section.page', 'section.page.project'],
    });

    if (!component) {
      throw new NotFoundException(`Component with ID "${componentId}" not found`);
    }

    return component;
  }

  async update(componentId: string, updateComponentDto: UpdateComponentDto, userId: string): Promise<Component> {
    const component = await this.findOne(componentId);

    if (component.section.page.project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this component');
    }

    Object.assign(component, updateComponentDto);
    return this.componentsRepository.save(component);
  }

  async remove(componentId: string, userId: string): Promise<void> {
    const component = await this.findOne(componentId);

    if (component.section.page.project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this component');
    }

    await this.componentsRepository.remove(component);
  }

  async batchUpdate(batchUpdateDto: BatchUpdateComponentsDto, userId: string): Promise<Component[]> {
    const componentIds = batchUpdateDto.components.map((c) => c.id);
    
    const components = await this.componentsRepository.find({
      where: { id: In(componentIds) },
      relations: ['section', 'section.page', 'section.page.project'],
    });

    if (components.length !== componentIds.length) {
      throw new NotFoundException('Some components were not found');
    }

    // Check permissions for all components
    for (const component of components) {
      if (component.section.page.project.userId !== userId) {
        throw new ForbiddenException('You do not have permission to update some components');
      }
    }

    // Apply updates
    const updatedComponents = batchUpdateDto.components.map((update) => {
      const component = components.find((c) => c.id === update.id)!;
      if (update.x !== undefined) component.x = update.x;
      if (update.y !== undefined) component.y = update.y;
      if (update.width !== undefined) component.width = update.width;
      if (update.height !== undefined) component.height = update.height;
      if (update.zIndex !== undefined) component.zIndex = update.zIndex;
      return component;
    });

    return this.componentsRepository.save(updatedComponents);
  }
}
