import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAbsenceReasonToMembers1773972895000 implements MigrationInterface {
    name = 'AddAbsenceReasonToMembers1773972895000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "absenceReason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "absenceReason"`);
    }
}
