import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '@/documents/document.entity';
import { DocumentsService } from '@/documents/documents.service';
import { DocumentsController } from '@/documents/documents.controller';
import { IngestionModule } from '@/ingestion/ingestion.module';
import { DocumentChunk } from '@/documents/document-chunk.entity';
import { DocumentChunksService } from '@/documents/document-chunks.service';
import { DocumentChunksController } from '@/documents/document-chunks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentChunk]), IngestionModule],
  providers: [DocumentsService, DocumentChunksService],
  controllers: [DocumentsController, DocumentChunksController],
  exports: [DocumentsService, DocumentChunksService],
})
export class DocumentsModule {}
