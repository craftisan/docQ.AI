import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentDto } from '@/documents/dto/create-document.dto';
import mammoth from 'mammoth';
import pdf, { Result } from 'pdf-parse';
import { IngestionService } from '@/ingestion/ingestion.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private docsRepo: Repository<Document>,
    private ingestionService: IngestionService,
  ) {}

  async create(dto: CreateDocumentDto, userId: string): Promise<Document> {
    const doc = this.docsRepo.create({ ...dto, userId });
    return this.docsRepo.save(doc);
  }

  async createFromFile(file: Express.Multer.File, userId: string): Promise<Document> {
    const name = file.originalname;
    const ext = name.split('.').pop()?.toLowerCase();
    let content: string;

    // Extract content from file
    if (ext === 'pdf') {
      const data: Result = await pdf(file.buffer);
      content = data.text;
    } else if (ext === 'docx') {
      const { value } = await mammoth.extractRawText({ buffer: file.buffer });
      content = value;
    } else if (ext === 'txt') {
      content = file.buffer.toString('utf-8');
    } else {
      // should never happen because of fileFilter, but safe:
      throw new BadRequestException(`Unsupported file extension .${ext}`);
    }

    // Save the Doc to DB
    const doc = this.docsRepo.create({ name, content, userId });
    const savedDoc = await this.docsRepo.save(doc);

    // Trigger ingestion job
    await this.ingestionService.trigger({ documentIds: [savedDoc.id] });

    return (await this.findById(savedDoc.id))!;
  }

  async findAll(): Promise<Document[]> {
    return this.docsRepo.find();
  }

  async findById(id: string): Promise<Document | null> {
    return this.docsRepo.findOneBy({ id });
  }

  async findAllByUser(userId: string): Promise<Document[]> {
    return this.docsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Document | null> {
    return this.docsRepo.findOne({
      where: { id, userId },
    });
  }

  async remove(id: string): Promise<boolean> {
    const { affected } = await this.docsRepo.delete(id);
    if (!affected) throw new NotFoundException(`Document ${id} not found`);

    return true;
  }
}
