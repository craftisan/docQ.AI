import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from 'typeorm';
import { Document } from '@/documents/document.entity';

export type IngestionStatus = 'pending' | 'running' | 'done' | 'failed';

@Entity()
export class IngestionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'done', 'failed'],
    default: 'pending',
  })
  status: IngestionStatus;

  @ManyToMany(() => Document, (doc) => doc.ingestionJobs, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'ingestion_job_documents',
    joinColumn: {
      name: 'ingestionJobId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'documentId',
      referencedColumnName: 'id',
    },
  })
  documents: Document[];

  @RelationId((job: IngestionJob) => job.documents)
  documentIds: string[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
