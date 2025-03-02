import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePrayerRequestTable1740848968506 implements MigrationInterface {
    name = 'CreatePrayerRequestTable1740848968506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "prayer_request" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "phone" character varying NOT NULL, "area" character varying NOT NULL, "request" character varying NOT NULL, CONSTRAINT "PK_1b9269859db4eca760407caf673" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "prayer_request"`);
    }

}
