import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type IngestionStatus = 'pending' | 'running' | 'done' | 'failed';

@Entity()
export class IngestionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-json' })
  documentIds: number[];

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'done', 'failed'],
    default: 'pending',
  })
  status: IngestionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
