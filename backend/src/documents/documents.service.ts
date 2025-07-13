import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private docsRepo: Repository<Document>,
  ) {}

  create(doc: Partial<Document>) {
    return this.docsRepo.save(doc);
  }

  findAll() {
    return this.docsRepo.find();
  }
}
