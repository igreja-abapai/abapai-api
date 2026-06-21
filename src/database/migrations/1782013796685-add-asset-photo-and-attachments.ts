import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetPhotoAndAttachments1782013796685 implements MigrationInterface {
    name = 'AddAssetPhotoAndAttachments1782013796685';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "assets" ADD COLUMN "photo_url" character varying(500)`,
        );

        await queryRunner.query(
            `CREATE TABLE "asset_attachments" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "asset_id" integer NOT NULL,
                "file_name" character varying(255) NOT NULL,
                "file_url" character varying(500) NOT NULL,
                "mime_type" character varying(100),
                "file_size" integer,
                CONSTRAINT "PK_asset_attachments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_asset_attachments_asset" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_asset_attachments_asset_id" ON "asset_attachments" ("asset_id")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_asset_attachments_asset_id"`);
        await queryRunner.query(`DROP TABLE "asset_attachments"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "photo_url"`);
    }
}
