import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { DocumentsModule } from '@/documents/documents.module';
import { APP_GUARD } from '@nestjs/core';
import { IngestionModule } from '@/ingestion/ingestion.module';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { AppDataSource } from '@/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
