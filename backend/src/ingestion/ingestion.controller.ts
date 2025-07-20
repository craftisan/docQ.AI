import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { IngestionService } from '@/ingestion/ingestion.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/users/dto/update-user-role.dto';
import { CreateIngestionDto } from '@/ingestion/dto/create-ingestion.dto';
import { IngestionJob } from '@/ingestion/ingestion-job.entity';

@Controller('ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  @Post('trigger')
  @Roles(Role.Admin, Role.Editor)
  async trigger(@Body() dto: CreateIngestionDto): Promise<IngestionJob> {
    return this.ingestionService.trigger(dto);
  }

  @Get('status')
  @Roles(Role.Admin, Role.Editor)
  async list(): Promise<IngestionJob[]> {
    return this.ingestionService.findAll();
  }

  @Get('status/:id')
  @Roles(Role.Admin, Role.Editor)
  async get(@Param('id') id: string): Promise<IngestionJob> {
    const job = await this.ingestionService.findOne(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
}
