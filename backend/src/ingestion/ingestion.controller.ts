import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IngestionService } from '@/ingestion/ingestion.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { Role } from '@/users/dto/update-user-role.dto';
import { CreateIngestionDto } from '@/ingestion/dto/create-ingestion.dto';

@Controller('ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  @Post('trigger')
  @Roles(Role.Admin, Role.Editor)
  trigger(@Body() dto: CreateIngestionDto) {
    return this.ingestionService.trigger(dto);
  }

  @Get('status')
  @Roles(Role.Admin, Role.Editor)
  list() {
    return this.ingestionService.findAll();
  }

  @Get('status/:id')
  @Roles(Role.Admin, Role.Editor)
  get(@Param('id') id: string) {
    return this.ingestionService.findOne(id);
  }
}
