import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRequestLogsTable1759908000000 implements MigrationInterface {
    name = 'CreateRequestLogsTable1759908000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "request_logs" (
                "id" BIGSERIAL NOT NULL,
                "method" character varying(16) NOT NULL,
                "path" text NOT NULL,
                "statusCode" integer,
                "responseTimeMs" integer,
                "ipAddress" character varying(255),
                "userAgent" text,
                "referer" text,
                "origin" text,
                "host" text,
                "userId" uuid,
                "clientName" character varying(255),
                "queryParams" jsonb,
                "body" jsonb,
                "headers" jsonb,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_request_logs_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(
            `CREATE INDEX "IDX_request_logs_created_at" ON "request_logs" ("createdAt")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_request_logs_method_path" ON "request_logs" ("method", "path")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_request_logs_method_path"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_request_logs_created_at"`);
        await queryRunner.query(`DROP TABLE "request_logs"`);
    }
}
