import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@/users/user.entity';
import { IngestionJob } from '@/ingestion/ingestion-job.entity';
import { DocumentChunk } from '@/documents/document-chunk.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // if we later want S3/URI storage:
  @Column({ nullable: true })
  storageUri?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToMany(() => DocumentChunk, (chunk) => chunk.document, {
    cascade: ['insert'],
  })
  chunks: DocumentChunk[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => IngestionJob, (job) => job.documents, {
    onDelete: 'CASCADE',
    eager: true,
  })
  ingestionJobs: IngestionJob[];
}
