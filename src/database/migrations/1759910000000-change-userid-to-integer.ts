import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserIdToInteger1759910000000 implements MigrationInterface {
    name = 'ChangeUserIdToInteger1759910000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the uuid column and recreate as integer
        await queryRunner.query(`ALTER TABLE "request_logs" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "request_logs" ADD "userId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to uuid
        await queryRunner.query(`ALTER TABLE "request_logs" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "request_logs" ADD "userId" uuid`);
    }
}
