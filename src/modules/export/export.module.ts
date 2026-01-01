import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { Project } from '../projects/entities/project.entity';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';
import { Component } from '../components/entities/component.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Page, Section, Component]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
