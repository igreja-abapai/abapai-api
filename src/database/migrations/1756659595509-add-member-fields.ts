import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberFields1756659595509 implements MigrationInterface {
    name = 'AddMemberFields1756659595509';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "childrenCount" integer`);
        await queryRunner.query(`ALTER TABLE "member" ADD "fatherName" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "motherName" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "lastPositionPeriod" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "baptismPlace" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "observations" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "observations"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "baptismPlace"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "lastPositionPeriod"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "motherName"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "fatherName"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "childrenCount"`);
    }
}
