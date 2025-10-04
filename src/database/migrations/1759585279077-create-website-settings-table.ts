import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebsiteSettingsTable1759585279077 implements MigrationInterface {
    name = 'CreateWebsiteSettingsTable1759585279077';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "website_settings" ("id" SERIAL NOT NULL, "churchName" text, "address" text, "phone" text, "email" text, "facebook" text, "instagram" text, "youtube" text, "about" text, "serviceTimes" text, "welcomeMessage" text, "aboutWhoWeAre" text, "aboutOurMission" text, "aboutOurValues" text, "isActive" boolean NOT NULL DEFAULT true, "maintenanceMode" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2fbf46b40c3cb5995d92c73fe68" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "website_settings"`);
    }
}
