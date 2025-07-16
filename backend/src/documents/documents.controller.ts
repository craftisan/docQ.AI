import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { Role } from '@/users/dto/update-user-role.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.Editor, Role.Viewer)
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
