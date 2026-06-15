import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChurchPositionsAndMemberPositionFks1781553294041 implements MigrationInterface {
    name = 'CreateChurchPositionsAndMemberPositionFks1781553294041';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."church_positions_category_enum" AS ENUM('Ministerial', 'Operacional')
        `);

        await queryRunner.query(`
            CREATE TABLE "church_positions" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying NOT NULL,
                "category" "public"."church_positions_category_enum" NOT NULL DEFAULT 'Ministerial',
                "description" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "sort_order" integer,
                CONSTRAINT "PK_church_positions" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "department_position_eligibility" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "department_id" integer NOT NULL,
                "church_position_id" integer NOT NULL,
                CONSTRAINT "PK_department_position_eligibility" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_department_position_eligibility" UNIQUE ("department_id", "church_position_id"),
                CONSTRAINT "FK_department_position_eligibility_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_department_position_eligibility_church_position" FOREIGN KEY ("church_position_id") REFERENCES "church_positions"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "member"
            ADD COLUMN "primary_position_id" integer,
            ADD COLUMN "secondary_position_id" integer
        `);

        await queryRunner.query(`
            ALTER TABLE "member"
            ADD CONSTRAINT "FK_member_primary_position" FOREIGN KEY ("primary_position_id") REFERENCES "church_positions"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "member"
            ADD CONSTRAINT "FK_member_secondary_position" FOREIGN KEY ("secondary_position_id") REFERENCES "church_positions"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "member" DROP CONSTRAINT "FK_member_secondary_position"
        `);
        await queryRunner.query(`
            ALTER TABLE "member" DROP CONSTRAINT "FK_member_primary_position"
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            DROP COLUMN "secondary_position_id",
            DROP COLUMN "primary_position_id"
        `);
        await queryRunner.query(`DROP TABLE "department_position_eligibility"`);
        await queryRunner.query(`DROP TABLE "church_positions"`);
        await queryRunner.query(`DROP TYPE "public"."church_positions_category_enum"`);
    }
}
