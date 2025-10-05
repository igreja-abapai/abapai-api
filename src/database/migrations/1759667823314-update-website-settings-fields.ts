import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWebsiteSettingsFields1759667823314 implements MigrationInterface {
    name = 'UpdateWebsiteSettingsFields1759667823314';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "churchName"`);
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "welcomeMessage"`);
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "twitter" text`);
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "weeklyMessageUrl" text`);
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "weeklyMessageTitle" text`);
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "weeklyMessageDate" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "weeklyMessageDate"`);
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "weeklyMessageTitle"`);
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "weeklyMessageUrl"`);
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "twitter"`);
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "welcomeMessage" text`);
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "churchName" text`);
        await queryRunner.query(
            `ALTER TABLE "website_settings" ADD "isActive" boolean NOT NULL DEFAULT true`,
        );
    }
}
