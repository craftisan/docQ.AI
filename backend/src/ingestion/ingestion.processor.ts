import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { DocumentChunksService } from '@/documents/document-chunks.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Processor('ingestion')
export class IngestionProcessor {
  private readonly logger = new Logger(IngestionProcessor.name);
  private readonly ragUrl: string;

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly chunkService: DocumentChunksService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.ragUrl = this.config.get<string>('RAG_BACKEND_URL') || 'http://localhost:8000';
  }

  /**
   * This listens for jobs of type 'process' on the 'ingestion' queue.
   *
   * @param job
   */
  @Process('process')
  async handleProcess(job: Job<{ jobId: string }>) {
    const jobId = job.data.jobId;

    // 1. mark the job as running
    await this.ingestionService.updateStatus(jobId, 'running');

    // 2. reload the job + its documents
    const ingestJob = await this.ingestionService.findOne(jobId);
    if (!ingestJob) {
      this.logger.error(`Job ${jobId} not found`);
      return;
    }

    try {
      // 3. for each document, pull *all* its chunks and call RAG-backend once
      for (const doc of ingestJob.documents) {
        const { chunks } = await this.chunkService.findChunks(doc.id, 1, Number.MAX_SAFE_INTEGER);
        const texts = chunks.map((chunk) => chunk.text);

        await firstValueFrom(
          this.http.post(`${this.ragUrl}/ingest/chunks`, {
            document_uuid: doc.id,
            document_name: doc.name,
            chunks: texts,
          }),
        );
      }

      // 4. all successful, mark job as done
      await this.ingestionService.updateStatus(jobId, 'done');
    } catch (err) {
      this.logger.error(`Error in job ${jobId}`, err);
      await this.ingestionService.updateStatus(jobId, 'failed');
    }
  }
}
