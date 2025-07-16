import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IngestionJob } from '@/ingestion/ingestion-job.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CreateIngestionDto } from '@/ingestion/dto/create-ingestion.dto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly ragUrl: string;

  constructor(
    @InjectRepository(IngestionJob)
    private repo: Repository<IngestionJob>,
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.ragUrl = this.config.get<string>('RAG_BACKEND_URL') || 'http://localhost:8000';
  }

  async trigger(dto: CreateIngestionDto): Promise<IngestionJob> {
    // First create a job with given documents and status as pending
    const job = this.repo.create({
      documentIds: dto.documentIds,
      status: 'pending',
    });
    await this.repo.save(job);

    // Fire the job to process the ingestion of documents with RAG-backend APIs
    this.process(job.id).catch((err) => {
      this.logger.error(`Job ${job.id} failed`, err);
    });

    return job;
  }

  private async process(jobId: string) {
    // Update the job status to running
    await this.repo.update(jobId, { status: 'running' });
    // Get the job object from DB
    const job = await this.repo.findOneBy({ id: jobId });
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    try {
      // Call RAG-backend ingest API
      await firstValueFrom(this.http.post(`${this.ragUrl}/ingest`, { document_ids: job.documentIds }));
      // If the ingestion is successful, mark the job as done
      await this.repo.update(jobId, { status: 'done' });
    } catch (err) {
      // If there is any error during ingestion, mark the job as failed
      this.logger.error(`Error in job ${jobId}`, err);
      await this.repo.update(jobId, { status: 'failed' });
    }
  }

  findAll(): Promise<IngestionJob[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<IngestionJob | null> {
    return this.repo.findOneBy({ id });
  }
}
