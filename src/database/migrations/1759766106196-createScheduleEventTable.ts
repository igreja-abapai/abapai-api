import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScheduleEventTable1759766106196 implements MigrationInterface {
    name = 'CreateScheduleEventTable1759766106196';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "schedule_events" ("id" SERIAL NOT NULL, "name" text NOT NULL, "time" text NOT NULL, "days" text NOT NULL, "position" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c14624cf0aa0f238ace86e789aa" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "schedule_events"`);
    }
}
