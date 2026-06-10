import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToMembers1773972896000 implements MigrationInterface {
    name = 'AddSoftDeleteToMembers1773972896000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "deletedAt"`);
    }
}
