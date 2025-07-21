import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/users/dto/update-user-role.dto';
import { Document } from '@/documents/document.entity';
import { CreateDocumentDto } from '@/documents/dto/create-document.dto';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const ALLOWED_MIMETYPES = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.Editor, Role.Viewer)
export class DocumentsController {
  constructor(private docsService: DocumentsService) {}

  @Get()
  async list(@GetUser('id') userId: string): Promise<Document[]> {
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Unsupported file type ${file.mimetype}. Please upload a PDF, DOCX or TXT file.`), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
    }),
  )
  async upload(@UploadedFile('file') file: Express.Multer.File, @GetUser('id') userId: string): Promise<Document> {
    return this.docsService.createFromFile(file, userId);
  }

  @Post('create')
  async create(@Body() dto: CreateDocumentDto, @GetUser('id') userId: string): Promise<Document> {
    return this.docsService.create(dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    return this.docsService.remove(id);
  }
}
