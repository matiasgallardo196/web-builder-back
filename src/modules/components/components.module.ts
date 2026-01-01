import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentsService } from './components.service';
import { ComponentsController } from './components.controller';
import { Component } from './entities/component.entity';
import { SectionsModule } from '../sections/sections.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Component]),
    SectionsModule,
  ],
  controllers: [ComponentsController],
  providers: [ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {}
