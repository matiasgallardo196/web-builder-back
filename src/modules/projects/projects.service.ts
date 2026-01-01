import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    // Check if user has reached maxProjects limit
    const userProjectCount = await this.projectsRepository.count({
      where: { userId: user.id },
    });

    if (userProjectCount >= user.maxProjects) {
      throw new ForbiddenException(
        `You have reached your project limit (${user.maxProjects}). Please upgrade to create more projects.`,
      );
    }

    // Check if slug already exists
    const existingProject = await this.projectsRepository.findOne({
      where: { slug: createProjectDto.slug },
    });

    if (existingProject) {
      throw new ConflictException('A project with this slug already exists');
    }

    const project = this.projectsRepository.create({
      ...createProjectDto,
      userId: user.id,
    });

    return this.projectsRepository.save(project);
  }

  async findAllByUser(userId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { slug },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    return project;
  }

  async findPublicBySlug(slug: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { slug, isPublic: true },
    });

    if (!project) {
      throw new NotFoundException(`Public project with slug "${slug}" not found`);
    }

    return project;
  }

  async update(slug: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findBySlug(slug);

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this project');
    }

    // If updating slug, check for conflicts
    if (updateProjectDto.slug && updateProjectDto.slug !== project.slug) {
      const existingProject = await this.projectsRepository.findOne({
        where: { slug: updateProjectDto.slug },
      });

      if (existingProject) {
        throw new ConflictException('A project with this slug already exists');
      }
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(slug: string, userId: string): Promise<void> {
    const project = await this.findBySlug(slug);

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this project');
    }

    await this.projectsRepository.remove(project);
  }
}
