import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { DocumentsModule } from '@/documents/documents.module';
import { User } from '@/users/user.entity';
import { Document } from '@/documents/document.entity';
import { APP_GUARD } from '@nestjs/core';
import { IngestionModule } from '@/ingestion/ingestion.module';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { IngestionJob } from '@/ingestion/ingestion-job.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: true, // disable in production
      entities: [User, Document, IngestionJob],
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
