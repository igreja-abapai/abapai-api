import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCarouselImagesTable1759802678722 implements MigrationInterface {
    name = 'CreateCarouselImagesTable1759802678722';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "carousel_images" ("id" SERIAL NOT NULL, "title" text NOT NULL, "imageUrl" text NOT NULL, "description" text, "linkUrl" text, "position" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_02f0cc1b693bd73004fa13b1718" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "carousel_images"`);
    }
}
