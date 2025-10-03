import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAdmissionDateType1759447775451 implements MigrationInterface {
    name = 'ChangeAdmissionDateType1759447775451';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "admissionDate"`);
        await queryRunner.query(`ALTER TABLE "member" ADD "admissionDate" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "admissionDate"`);
        await queryRunner.query(`ALTER TABLE "member" ADD "admissionDate" date`);
    }
}
