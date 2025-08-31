import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdmissionFields1756663721664 implements MigrationInterface {
    name = 'AddAdmissionFields1756663721664';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "admissionDate" date`);
        await queryRunner.query(
            `CREATE TYPE "public"."member_admissiontype_enum" AS ENUM('Confissão de fé', 'Reconciliação', 'Transferência')`,
        );
        await queryRunner.query(
            `ALTER TABLE "member" ADD "admissionType" "public"."member_admissiontype_enum"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "admissionType"`);
        await queryRunner.query(`DROP TYPE "public"."member_admissiontype_enum"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "admissionDate"`);
    }
}
