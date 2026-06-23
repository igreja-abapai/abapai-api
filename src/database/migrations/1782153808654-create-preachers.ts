import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePreachers1782153808654 implements MigrationInterface {
    name = 'CreatePreachers1782153808654';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "preachers" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying(255) NOT NULL,
                "phone" character varying(30),
                "photo_url" character varying(500),
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_preachers" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "service_assignments"
            ADD COLUMN "preacher_id" integer
        `);

        await queryRunner.query(`
            ALTER TABLE "service_assignments"
            ADD CONSTRAINT "FK_service_assignments_preacher"
            FOREIGN KEY ("preacher_id") REFERENCES "preachers"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "service_assignments" DROP CONSTRAINT "FK_service_assignments_preacher"
        `);
        await queryRunner.query(`
            ALTER TABLE "service_assignments" DROP COLUMN "preacher_id"
        `);
        await queryRunner.query(`DROP TABLE "preachers"`);
    }
}
