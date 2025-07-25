import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunk } from './document-chunk.entity';

export interface ChunkPage {
  chunks: DocumentChunk[];
  total: number;
  page: number;
  perPage: number;
}

@Injectable()
export class DocumentChunksService {
  constructor(
    @InjectRepository(DocumentChunk)
    private readonly repo: Repository<DocumentChunk>,
  ) {}

  async findChunks(documentId: string, page = 1, perPage = 10): Promise<ChunkPage> {
    const [chunks, total] = await this.repo.findAndCount({
      where: { documentId },
      order: { chunkIndex: 'ASC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { chunks, total, page, perPage };
  }
}
