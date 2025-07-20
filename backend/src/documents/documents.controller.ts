import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/users/dto/update-user-role.dto';
import { Document } from '@/documents/document.entity';
import { CreateDocumentDto } from '@/documents/dto/create-document.dto';
import { GetUser } from '@/auth/decorators/get-user.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.Editor, Role.Viewer)
export class DocumentsController {
  constructor(private docsService: DocumentsService) {}

  @Get()
  async list(@GetUser('id') userId: string) {
    return this.docsService.findAllByUser(userId);
  }

  @Get(':id')
  async find(@Param('id') id: string, @GetUser('id') userId: string): Promise<Document> {
    const document = await this.docsService.findByIdAndUser(id, userId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  @Post('upload')
  async upload(@Body() dto: CreateDocumentDto, @GetUser('id') userId: string) {
    return this.docsService.create(dto, userId);
  }
}
