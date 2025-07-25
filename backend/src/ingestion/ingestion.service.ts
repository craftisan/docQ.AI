import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IngestionJob, IngestionStatus } from '@/ingestion/ingestion-job.entity';
import { In, Repository } from 'typeorm';
import { CreateIngestionDto } from '@/ingestion/dto/create-ingestion.dto';
import { Document } from '@/documents/document.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(IngestionJob)
    private ingestionRepo: Repository<IngestionJob>,
    @InjectRepository(Document)
    private readonly docsRepo: Repository<Document>,
    @InjectQueue('ingestion')
    private readonly ingestionQueue: Queue,
  ) {}

  async trigger(dto: CreateIngestionDto): Promise<IngestionJob> {
    // 1. Load the documents
    const docs = await this.docsRepo.findBy({ id: In(dto.documentIds) });
    if (docs.length === 0) {
      throw new NotFoundException(`No documents found for IDs ${dto.documentIds.join(', ')}`);
    }
    // 2. Create a job with given documents and status as pending
    const job = this.ingestionRepo.create({ documents: docs, status: 'pending' });
    await this.ingestionRepo.save(job);

    // Fire and queue the job to process the ingestion of documents with RAG-backend APIs
    await this.ingestionQueue.add('process', { jobId: job.id });

    // Return the job object with relations
    return (await this.findOne(job.id))!;
  }

  async updateStatus(jobId: string, status: IngestionStatus) {
    await this.ingestionRepo.update(jobId, { status });
  }

  findAll(): Promise<IngestionJob[]> {
    return this.ingestionRepo.find({ relations: ['documents'], order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<IngestionJob | null> {
    return this.ingestionRepo.findOne({
      where: { id },
      relations: ['documents'],
    });
  }
}
