import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankInfo1759793879348 implements MigrationInterface {
    name = 'AddBankInfo1759793879348';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "bankInfo" jsonb`);
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "pixInfo" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "pixInfo"`);
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "bankInfo"`);
    }
}
