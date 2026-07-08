import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMemberDiscipleshipCase1783517503512 implements MigrationInterface {
    name = 'CreateMemberDiscipleshipCase1783517503512';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."member_discipleship_case_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED')`,
        );
        await queryRunner.query(`
            CREATE TABLE "member_discipleship_case" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "member_id" integer NOT NULL,
                "status" "public"."member_discipleship_case_status_enum" NOT NULL DEFAULT 'PENDING',
                "reason" text,
                "notes" text,
                "opened_at" TIMESTAMP NOT NULL,
                "closed_at" TIMESTAMP,
                "closed_by" integer,
                CONSTRAINT "PK_member_discipleship_case_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(
            `CREATE INDEX "IDX_member_discipleship_case_member_id" ON "member_discipleship_case" ("member_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_member_discipleship_case_status" ON "member_discipleship_case" ("status")`,
        );
        await queryRunner.query(`
            ALTER TABLE "member_discipleship_case"
            ADD CONSTRAINT "FK_member_discipleship_case_member_id"
            FOREIGN KEY ("member_id") REFERENCES "member"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "member_discipleship_case" DROP CONSTRAINT "FK_member_discipleship_case_member_id"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_member_discipleship_case_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_member_discipleship_case_member_id"`);
        await queryRunner.query(`DROP TABLE "member_discipleship_case"`);
        await queryRunner.query(`DROP TYPE "public"."member_discipleship_case_status_enum"`);
    }
}
