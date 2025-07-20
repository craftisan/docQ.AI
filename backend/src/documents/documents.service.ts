import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentDto } from '@/documents/dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private docsRepo: Repository<Document>,
  ) {}

  async create(dto: CreateDocumentDto, userId: string): Promise<Document> {
    const doc = this.docsRepo.create({ ...dto, userId });
    return this.docsRepo.save(doc);
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
}
