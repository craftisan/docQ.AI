import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionJob } from '@/ingestion/ingestion-job.entity';
import { IngestionService } from '@/ingestion/ingestion.service';
import { IngestionController } from '@/ingestion/ingestion.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Document } from '@/documents/document.entity';
import { BullModule } from '@nestjs/bull';
import { IngestionProcessor } from '@/ingestion/ingestion.processor';
import { DocumentsModule } from '@/documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngestionJob, Document]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        baseURL: cs.get('RAG_BACKEND_URL'),
        timeout: 5000,
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'ingestion',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
    forwardRef(() => DocumentsModule),
  ],
  providers: [IngestionService, IngestionProcessor],
  controllers: [IngestionController],
  exports: [IngestionService],
})
export class IngestionModule {}
