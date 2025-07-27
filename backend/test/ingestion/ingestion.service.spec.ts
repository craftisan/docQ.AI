import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';
import { getQueueToken } from '@nestjs/bull';

import { IngestionService } from '@/ingestion/ingestion.service';
import { IngestionJob, IngestionStatus } from '@/ingestion/ingestion-job.entity';
import { Document } from '@/documents/document.entity';
import { CreateIngestionDto } from '@/ingestion/dto/create-ingestion.dto';
import { createMockRepo, MockRepo } from '../mock-repository';

describe('IngestionService', () => {
  let service: IngestionService;
  let ingestionRepo: MockRepo<IngestionJob>;
  let docsRepo: MockRepo<Document>;
  let queue: { add: jest.Mock };

  const UUID = '550e8400-e29b-41d4-a716-446655440000';
  const dto: CreateIngestionDto = { documentIds: [UUID] };
  const now = new Date();

  beforeEach(async () => {
    jest.clearAllMocks();

    ingestionRepo = createMockRepo<IngestionJob>();
    ingestionRepo.update = jest.fn();
    docsRepo = createMockRepo<Document>();
    docsRepo.findBy = jest.fn();
    queue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: getRepositoryToken(IngestionJob), useValue: ingestionRepo },
        { provide: getRepositoryToken(Document), useValue: docsRepo },
        { provide: getQueueToken('ingestion'), useValue: queue },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
  });

  describe('trigger()', () => {
    it('throws NotFoundException when no documents are found', async () => {
      docsRepo.findBy!.mockResolvedValue([]);
      await expect(service.trigger(dto)).rejects.toThrow(NotFoundException);
      expect(docsRepo.findBy).toHaveBeenCalledWith({ id: In(dto.documentIds) });
    });

    it('creates a job, queues it, and returns the job', async () => {
      const mockDocs = [{ id: UUID }] as Document[];
      docsRepo.findBy!.mockResolvedValue(mockDocs);

      const createdJob = { id: UUID, status: 'pending', documents: mockDocs } as IngestionJob;
      ingestionRepo.create!.mockReturnValue(createdJob);
      ingestionRepo.save!.mockResolvedValue(createdJob);
      ingestionRepo.findOne!.mockResolvedValue(createdJob);

      const result = await service.trigger(dto);

      expect(docsRepo.findBy).toHaveBeenCalledWith({ id: In(dto.documentIds) });
      expect(ingestionRepo.create).toHaveBeenCalledWith({
        documents: mockDocs,
        status: 'pending',
      });
      expect(ingestionRepo.save).toHaveBeenCalledWith(createdJob);
      expect(queue.add).toHaveBeenCalledWith('process', { jobId: UUID });
      expect(result).toEqual(createdJob);
    });
  });

  describe('updateStatus()', () => {
    it('updates job status', async () => {
      await service.updateStatus(UUID, 'completed' as IngestionStatus);
      expect(ingestionRepo.update).toHaveBeenCalledWith(UUID, { status: 'completed' });
    });
  });

  describe('findAll()', () => {
    it('returns all jobs with relations', async () => {
      const list = [
        {
          id: UUID,
          status: 'pending' as IngestionStatus,
          documents: [],
          documentIds: [],
          createdAt: now,
          updatedAt: now,
        },
      ] as IngestionJob[];
      ingestionRepo.find!.mockResolvedValue(list);
      const result = await service.findAll();
      expect(ingestionRepo.find).toHaveBeenCalledWith({
        relations: ['documents'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(list);
    });
  });

  describe('findOne()', () => {
    it('returns single job by id with relations', async () => {
      const job = {
        id: UUID,
        status: 'pending' as IngestionStatus,
        documents: [],
        documentIds: [],
        createdAt: now,
        updatedAt: now,
      } as IngestionJob;
      ingestionRepo.findOne!.mockResolvedValue(job);
      const result = await service.findOne(UUID);
      expect(ingestionRepo.findOne).toHaveBeenCalledWith({
        where: { id: UUID },
        relations: ['documents'],
      });
      expect(result).toBe(job);
    });
  });
});
