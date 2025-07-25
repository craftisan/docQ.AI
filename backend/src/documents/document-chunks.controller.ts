import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ChunkPage, DocumentChunksService } from '@/documents/document-chunks.service';

@Controller('documents/:id/chunks')
@UseGuards(JwtAuthGuard)
export class DocumentChunksController {
  constructor(private readonly chunks: DocumentChunksService) {}

  @Get()
  async list(@Param('id') id: string, @Query('page', ParseIntPipe) page: number = 1, @Query('perPage', ParseIntPipe) perPage: number = 10): Promise<ChunkPage> {
    return this.chunks.findChunks(id, page, perPage);
  }
}
