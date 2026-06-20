import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropMemberCurrentPosition1781966790053 implements MigrationInterface {
    name = 'DropMemberCurrentPosition1781966790053';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "member" DROP COLUMN "currentPosition"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "member" ADD COLUMN "currentPosition" character varying
        `);
    }
}
