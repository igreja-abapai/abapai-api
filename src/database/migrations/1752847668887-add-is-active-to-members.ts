import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToMembers1752847668887 implements MigrationInterface {
    name = 'AddIsActiveToMembers1752847668887';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "member" ADD "isActive" boolean NOT NULL DEFAULT true`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "isActive"`);
    }
}
