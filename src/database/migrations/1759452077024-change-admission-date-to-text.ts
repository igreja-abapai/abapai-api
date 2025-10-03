import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAdmissionDateToText1759452077024 implements MigrationInterface {
    name = 'ChangeAdmissionDateToText1759452077024';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "admissionDate"`);
        await queryRunner.query(`ALTER TABLE "member" ADD "admissionDate" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "admissionDate"`);
        await queryRunner.query(`ALTER TABLE "member" ADD "admissionDate" character varying`);
    }
}
