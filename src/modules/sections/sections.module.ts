import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { Section } from './entities/section.entity';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    PagesModule,
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
