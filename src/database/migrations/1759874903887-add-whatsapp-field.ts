import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhatsappField1759874903887 implements MigrationInterface {
    name = 'AddWhatsappField1759874903887';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "website_settings" ADD "whatsapp" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "website_settings" DROP COLUMN "whatsapp"`);
    }
}
