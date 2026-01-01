import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Section } from '../../sections/entities/section.entity';

export enum ComponentType {
  TEXT = 'text',
  IMAGE = 'image',
  CONTAINER = 'container',
  BUTTON = 'button',
  LINK = 'link',
  FORM = 'form',
}

@Entity('components')
export class Component {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ComponentType })
  type: ComponentType;

  @Column({ type: 'float', default: 0 })
  x: number;

  @Column({ type: 'float', default: 0 })
  y: number;

  @Column({ type: 'float', default: 200 })
  width: number;

  @Column({ type: 'float', default: 100 })
  height: number;

  @Column({ type: 'jsonb', nullable: true })
  props: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  styles: Record<string, unknown>;

  @Column({ default: 0 })
  zIndex: number;

  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  section: Section;

  @Column()
  sectionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
