import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pagesRepository: Repository<Page>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(projectSlug: string, createPageDto: CreatePageDto, userId: string): Promise<Page> {
    const project = await this.projectsService.findBySlug(projectSlug);

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to add pages to this project');
    }

    // If this page is set as home, unset other home pages
    if (createPageDto.isHome) {
      await this.pagesRepository.update(
        { projectId: project.id },
        { isHome: false },
      );
    }

    // Get max order to place new page at end
    const maxOrder = await this.pagesRepository
      .createQueryBuilder('page')
      .where('page.projectId = :projectId', { projectId: project.id })
      .select('MAX(page.order)', 'max')
      .getRawOne();

    const page = this.pagesRepository.create({
      ...createPageDto,
      projectId: project.id,
      order: createPageDto.order ?? (maxOrder?.max ?? -1) + 1,
    });

    return this.pagesRepository.save(page);
  }

  async findAllByProject(projectSlug: string): Promise<Page[]> {
    const project = await this.projectsService.findBySlug(projectSlug);

    return this.pagesRepository.find({
      where: { projectId: project.id },
      order: { order: 'ASC' },
    });
  }

  async findOne(pageId: string): Promise<Page> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId },
      relations: ['project'],
    });

    if (!page) {
      throw new NotFoundException(`Page with ID "${pageId}" not found`);
    }

    return page;
  }

  async update(pageId: string, updatePageDto: UpdatePageDto, userId: string): Promise<Page> {
    const page = await this.findOne(pageId);
    const project = await this.projectsService.findBySlug(page.project.slug);

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this page');
    }

    // If setting this page as home, unset other home pages
    if (updatePageDto.isHome) {
      await this.pagesRepository.update(
        { projectId: project.id },
        { isHome: false },
      );
    }

    Object.assign(page, updatePageDto);
    return this.pagesRepository.save(page);
  }

  async remove(pageId: string, userId: string): Promise<void> {
    const page = await this.findOne(pageId);
    const project = await this.projectsService.findBySlug(page.project.slug);

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this page');
    }

    await this.pagesRepository.remove(page);
  }

  async reorder(projectSlug: string, pageIds: string[], userId: string): Promise<Page[]> {
    const project = await this.projectsService.findBySlug(projectSlug);

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to reorder pages in this project');
    }

    const pages = await this.pagesRepository.find({
      where: { id: In(pageIds), projectId: project.id },
    });

    if (pages.length !== pageIds.length) {
      throw new NotFoundException('Some pages were not found or do not belong to this project');
    }

    // Update order based on array position
    const updatedPages = pageIds.map((id, index) => {
      const page = pages.find((p) => p.id === id)!;
      page.order = index;
      return page;
    });

    return this.pagesRepository.save(updatedPages);
  }
}
