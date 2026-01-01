import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { PagesService } from '../pages/pages.service';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionsRepository: Repository<Section>,
    private readonly pagesService: PagesService,
  ) {}

  async create(pageId: string, createSectionDto: CreateSectionDto, userId: string): Promise<Section> {
    const page = await this.pagesService.findOne(pageId);
    
    if (page.project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to add sections to this page');
    }

    // Get max order to place new section at end
    const maxOrder = await this.sectionsRepository
      .createQueryBuilder('section')
      .where('section.pageId = :pageId', { pageId })
      .select('MAX(section.order)', 'max')
      .getRawOne();

    const section = this.sectionsRepository.create({
      ...createSectionDto,
      pageId,
      order: createSectionDto.order ?? (maxOrder?.max ?? -1) + 1,
    });

    return this.sectionsRepository.save(section);
  }

  async findAllByPage(pageId: string): Promise<Section[]> {
    return this.sectionsRepository.find({
      where: { pageId },
      order: { order: 'ASC' },
      relations: ['page'],
    });
  }

  async findOne(sectionId: string): Promise<Section> {
    const section = await this.sectionsRepository.findOne({
      where: { id: sectionId },
      relations: ['page', 'page.project'],
    });

    if (!section) {
      throw new NotFoundException(`Section with ID "${sectionId}" not found`);
    }

    return section;
  }

  async update(sectionId: string, updateSectionDto: UpdateSectionDto, userId: string): Promise<Section> {
    const section = await this.findOne(sectionId);

    if (section.page.project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this section');
    }

    Object.assign(section, updateSectionDto);
    return this.sectionsRepository.save(section);
  }

  async remove(sectionId: string, userId: string): Promise<void> {
    const section = await this.findOne(sectionId);

    if (section.page.project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this section');
    }

    await this.sectionsRepository.remove(section);
  }

  async reorder(pageId: string, sectionIds: string[], userId: string): Promise<Section[]> {
    const page = await this.pagesService.findOne(pageId);

    if (page.project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to reorder sections');
    }

    const sections = await this.sectionsRepository.find({
      where: { id: In(sectionIds), pageId },
    });

    if (sections.length !== sectionIds.length) {
      throw new NotFoundException('Some sections were not found');
    }

    const updatedSections = sectionIds.map((id, index) => {
      const section = sections.find((s) => s.id === id)!;
      section.order = index;
      return section;
    });

    return this.sectionsRepository.save(updatedSections);
  }
}
