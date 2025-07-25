import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1753033939954 implements MigrationInterface {
  name = 'InitSchema1753033939954';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."ingestion_job_status_enum" AS ENUM('pending', 'running', 'done', 'failed')`);
    await queryRunner.query(
      `CREATE TABLE "ingestion_job"
       (
         "id"        uuid                                 NOT NULL DEFAULT uuid_generate_v4(),
         "status"    "public"."ingestion_job_status_enum" NOT NULL DEFAULT 'pending',
         "createdAt" TIMESTAMP WITH TIME ZONE             NOT NULL DEFAULT now(),
         "updatedAt" TIMESTAMP WITH TIME ZONE             NOT NULL DEFAULT now(),
         CONSTRAINT "PK_9bce28c45e529ea38284b6aeac3" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_chunk"
       (
         "id"         uuid                     NOT NULL DEFAULT uuid_generate_v4(),
         "documentId" uuid                     NOT NULL,
         "chunkIndex" integer                  NOT NULL,
         "text"       text                     NOT NULL,
         "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         CONSTRAINT "PK_70d9772bf367d82f9b7e568c87c" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_f3d28fcd881e5d84931d47aba9" ON "document_chunk" ("documentId", "chunkIndex") `);
    await queryRunner.query(
      `CREATE TABLE "document"
       (
         "id"         uuid                     NOT NULL DEFAULT uuid_generate_v4(),
         "name"       character varying        NOT NULL,
         "content"    text                     NOT NULL,
         "storageUri" character varying,
         "userId"     uuid                     NOT NULL,
         "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "updatedAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user"
       (
         "id"        uuid                     NOT NULL DEFAULT uuid_generate_v4(),
         "email"     character varying        NOT NULL,
         "password"  character varying        NOT NULL,
         "name"      character varying        NOT NULL,
         "role"      character varying        NOT NULL DEFAULT 'viewer',
         "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
         CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "ingestion_job_documents"
       (
         "ingestionJobId" uuid NOT NULL,
         "documentId"     uuid NOT NULL,
         CONSTRAINT "PK_976dbb40c91d10b9737fb20e26c" PRIMARY KEY ("ingestionJobId", "documentId")
       )`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_46beb02fb591d7fc78ae9b64d5" ON "ingestion_job_documents" ("ingestionJobId") `);
    await queryRunner.query(`CREATE INDEX "IDX_24fc96bf1e25039908a5a82b99" ON "ingestion_job_documents" ("documentId") `);
    await queryRunner.query(
      `ALTER TABLE "document_chunk"
        ADD CONSTRAINT "FK_3e9a852328831b703e5ef175ca8" FOREIGN KEY ("documentId") REFERENCES "document" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document"
        ADD CONSTRAINT "FK_7424ddcbdf1e9b067669eb0d3fd" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingestion_job_documents"
        ADD CONSTRAINT "FK_46beb02fb591d7fc78ae9b64d58" FOREIGN KEY ("ingestionJobId") REFERENCES "ingestion_job" ("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingestion_job_documents"
        ADD CONSTRAINT "FK_24fc96bf1e25039908a5a82b995" FOREIGN KEY ("documentId") REFERENCES "document" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ingestion_job_documents"
      DROP CONSTRAINT "FK_24fc96bf1e25039908a5a82b995"`);
    await queryRunner.query(`ALTER TABLE "ingestion_job_documents"
      DROP CONSTRAINT "FK_46beb02fb591d7fc78ae9b64d58"`);
    await queryRunner.query(`ALTER TABLE "document"
      DROP CONSTRAINT "FK_7424ddcbdf1e9b067669eb0d3fd"`);
    await queryRunner.query(`ALTER TABLE "document_chunk"
      DROP CONSTRAINT "FK_3e9a852328831b703e5ef175ca8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_24fc96bf1e25039908a5a82b99"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_46beb02fb591d7fc78ae9b64d5"`);
    await queryRunner.query(`DROP TABLE "ingestion_job_documents"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "document"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f3d28fcd881e5d84931d47aba9"`);
    await queryRunner.query(`DROP TABLE "document_chunk"`);
    await queryRunner.query(`DROP TABLE "ingestion_job"`);
    await queryRunner.query(`DROP TYPE "public"."ingestion_job_status_enum"`);
  }
}
