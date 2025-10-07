import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteTitleAndDescriptionFromImages1759846733394 implements MigrationInterface {
    name = 'DeleteTitleAndDescriptionFromImages1759846733394';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carousel_images" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "carousel_images" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carousel_images" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "carousel_images" ADD "title" text NOT NULL`);
    }
}
