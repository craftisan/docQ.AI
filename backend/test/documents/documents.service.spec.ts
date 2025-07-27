// Mock external parsers
import { createMockRepo, MockRepo } from '../mock-repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import pdf, { Result as PdfResult } from 'pdf-parse';
import mammoth from 'mammoth';

import { DocumentsService } from '@/documents/documents.service';
import { Document } from '@/documents/document.entity';
import { DocumentChunk } from '@/documents/document-chunk.entity';
import { IngestionService } from '@/ingestion/ingestion.service';

jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: jest.fn<Promise<{ text: string }>, [Buffer]>(() => Promise.resolve({ text: '' })),
}));
jest.mock('mammoth', () => ({
  extractRawText: jest.fn<Promise<{ value: string }>, [{ buffer: Buffer }]>(() => Promise.resolve({ value: '' })),
}));

// simple mock‐factory for TypeORM repos

jest.mock('pdf-parse');
jest.mock('mammoth');

describe('DocumentsService', () => {
  let service: DocumentsService;
  let docsRepo: MockRepo<Document>;
  let chunkRepo: MockRepo<DocumentChunk>;
  let ingestion: { trigger: jest.Mock };

  const UUID = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    docsRepo = createMockRepo<Document>();
    chunkRepo = createMockRepo<DocumentChunk>();
    ingestion = { trigger: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: docsRepo },
        { provide: getRepositoryToken(DocumentChunk), useValue: chunkRepo },
        { provide: IngestionService, useValue: ingestion },
      ],
    }).compile();

    service = module.get(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromFile()', () => {
    const baseFile = (name: string, buffer: Buffer) =>
      ({
        originalname: name,
        buffer,
      }) as Express.Multer.File;

    it('parses PDF, chunks, saves, and triggers ingestion', async () => {
      // mock pdf-parse
      (pdf as jest.Mock).mockResolvedValue({ text: 'A'.repeat(2500) } as PdfResult);
      docsRepo.save!.mockResolvedValue({ id: UUID, name: 'f.pdf', userId: 'U' });
      chunkRepo.save!.mockResolvedValue([]);

      docsRepo.findOneBy!.mockResolvedValue({ id: UUID, name: 'f.pdf' } as Document);

      const file = baseFile('f.pdf', Buffer.from('dummy'));
      const result = await service.createFromFile(file, 'U');

      expect(pdf).toHaveBeenCalledWith(file.buffer);
      expect(chunkRepo.create).toHaveBeenCalled();
      expect(ingestion.trigger).toHaveBeenCalledWith({ documentIds: [UUID] });
      expect(result.id).toBe(UUID);
    });

    it('parses DOCX via mammoth', async () => {
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({ value: 'X'.repeat(1500) });
      docsRepo.save!.mockResolvedValue({ id: UUID, name: 'f.docx', userId: 'U' });
      chunkRepo.save!.mockResolvedValue([]);
      docsRepo.findOneBy!.mockResolvedValue({ id: UUID } as Document);

      const file = baseFile('f.docx', Buffer.from('dummy'));
      const result = await service.createFromFile(file, 'U');

      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer: file.buffer });
      expect(ingestion.trigger).toHaveBeenCalled();
      expect(result.id).toBe(UUID);
    });

    it('parses TXT files', async () => {
      docsRepo.save!.mockResolvedValue({ id: UUID, name: 'f.txt', userId: 'U' });
      chunkRepo.save!.mockResolvedValue([]);
      docsRepo.findOneBy!.mockResolvedValue({ id: UUID } as Document);

      const file = baseFile('f.txt', Buffer.from('hello world'));
      const result = await service.createFromFile(file, 'U');

      // txt: buffer.toString
      expect(ingestion.trigger).toHaveBeenCalled();
      expect(result.id).toBe(UUID);
    });

    it('throws on unsupported extension', async () => {
      const file = baseFile('f.xlsx', Buffer.from(''));
      await expect(service.createFromFile(file, 'U')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll & findById flows', () => {
    it('findAll() → delegates to repo.find', async () => {
      docsRepo.find!.mockResolvedValue([{ id: UUID }] as Document[]);
      const docs = await service.findAll();
      expect(docsRepo.find).toHaveBeenCalled();
      expect(docs).toHaveLength(1);
    });

    it('findById() → delegates to repo.findOneBy', async () => {
      docsRepo.findOneBy!.mockResolvedValue({ id: UUID } as Document);
      const doc = await service.findById(UUID);
      expect(docsRepo.findOneBy).toHaveBeenCalledWith({ id: UUID });
      if (doc) {
        expect(doc.id).toBe(UUID);
      }
    });

    it('findAllByUser() uses correct where/order', async () => {
      docsRepo.find!.mockResolvedValue([]);
      await service.findAllByUser('U');
      expect(docsRepo.find).toHaveBeenCalledWith({
        where: { userId: 'U' },
        order: { createdAt: 'DESC' },
      });
    });

    it('findByIdAndUser() uses correct where', async () => {
      docsRepo.findOne!.mockResolvedValue({ id: UUID, userId: 'U' } as Document);
      const doc = await service.findByIdAndUser(UUID, 'U');
      expect(docsRepo.findOne).toHaveBeenCalledWith({
        where: { id: UUID, userId: 'U' },
      });
      if (doc) {
        expect(doc.userId).toBe('U');
      }
    });
  });

  describe('remove()', () => {
    it('returns true when delete.affected >0', async () => {
      docsRepo.delete!.mockResolvedValue({ affected: 1 });
      const res = await service.remove(UUID);
      expect(docsRepo.delete).toHaveBeenCalledWith(UUID);
      expect(res).toBe(true);
    });

    it('throws NotFoundException when affected=0', async () => {
      docsRepo.delete!.mockResolvedValue({ affected: 0 });
      await expect(service.remove(UUID)).rejects.toThrow(NotFoundException);
    });
  });
});
