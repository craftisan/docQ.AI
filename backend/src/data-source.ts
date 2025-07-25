import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '@/users/user.entity';
import { Document } from '@/documents/document.entity';
import { IngestionJob } from '@/ingestion/ingestion-job.entity';
import { DocumentChunk } from '@/documents/document-chunk.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Document, DocumentChunk, IngestionJob],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: process.env.MIGRATION_SYNC?.toLowerCase() === 'true',
  dropSchema: false,
  logging: ['query', 'schema', 'error', 'warn', 'info', 'log', 'migration'],
});
