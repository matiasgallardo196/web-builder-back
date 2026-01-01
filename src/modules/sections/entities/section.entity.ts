import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Page } from '../../pages/entities/page.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  order: number;

  @Column({ type: 'int', default: 400 })
  height: number;

  @Column({ type: 'jsonb', nullable: true })
  styles: Record<string, unknown>;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  page: Page;

  @Column()
  pageId: string;

  // Relation will be added when Component entity is created
  // @OneToMany(() => Component, (component) => component.section)
  // components: Component[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
