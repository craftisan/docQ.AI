import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private docsService: DocumentsService) {}

  @Post('upload')
  async upload(@Body() body: { name: string; content: string }) {
    return this.docsService.create(body);
  }

  @Get()
  async list() {
    return this.docsService.findAll();
  }
}
