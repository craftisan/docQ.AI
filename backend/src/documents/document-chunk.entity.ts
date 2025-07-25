import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from '@/documents/document.entity';

@Entity()
@Index(['documentId', 'chunkIndex'])
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Document, (doc) => doc.chunks, { onDelete: 'CASCADE' })
  document: Document;

  @Column('int')
  chunkIndex: number;

  @Column('text')
  text: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
