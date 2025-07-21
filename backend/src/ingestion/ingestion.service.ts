import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IngestionJob } from '@/ingestion/ingestion-job.entity';
import { In, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CreateIngestionDto } from '@/ingestion/dto/create-ingestion.dto';
import { Document } from '@/documents/document.entity';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly ragUrl: string;

  constructor(
    @InjectRepository(IngestionJob)
    private ingestionRepo: Repository<IngestionJob>,
    @InjectRepository(Document)
    private readonly docsRepo: Repository<Document>,
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.ragUrl = this.config.get<string>('RAG_BACKEND_URL') || 'http://localhost:8000';
  }

  async trigger(dto: CreateIngestionDto): Promise<IngestionJob> {
    // First create a job with given documents and status as pending
    const docs = await this.docsRepo.findBy({ id: In(dto.documentIds) });
    const job = this.ingestionRepo.create({ documents: docs, status: 'pending' });
    await this.ingestionRepo.save(job);

    // Fire the job to process the ingestion of documents with RAG-backend APIs
    await this.process(job.id);

    return (await this.findOne(job.id))!;
  }

  private async process(jobId: string) {
    // Update the job status to running
    await this.ingestionRepo.update(jobId, { status: 'running' });
    // Get the job object from DB
    const job = await this.findOne(jobId);
    console.log('job', job);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const latestDocument = job.documents.at(-1) ?? null;

    console.log(latestDocument);

    if (latestDocument) {
      try {
        // Call RAG-backend ingest API
        await firstValueFrom(
          this.http.post(`${this.ragUrl}/ingest/`, {
            document_uuid: latestDocument.id,
            document_name: latestDocument.name,
            document_content: latestDocument.content,
          }),
        );
        // If the ingestion is successful, mark the job as done
        await this.ingestionRepo.update(jobId, { status: 'done' });
      } catch (err) {
        // If there is any error during ingestion, mark the job as failed
        this.logger.error(`Error in job ${jobId}`, err);
        await this.ingestionRepo.update(jobId, { status: 'failed' });
      }
    }
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
