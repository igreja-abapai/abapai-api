import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameWorshipServiceCompletedToConfirmed1783621143462 implements MigrationInterface {
    name = 'RenameWorshipServiceCompletedToConfirmed1783621143462';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."worship_services_status_enum"
            RENAME VALUE 'Concluída' TO 'Confirmada'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."worship_services_status_enum"
            RENAME VALUE 'Confirmada' TO 'Concluída'
        `);
    }
}
