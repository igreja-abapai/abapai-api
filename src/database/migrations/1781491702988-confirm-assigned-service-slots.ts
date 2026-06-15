import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfirmAssignedServiceSlots1781491702988 implements MigrationInterface {
    name = 'ConfirmAssignedServiceSlots1781491702988';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "service_assignments"
            SET "status" = 'Confirmada'
            WHERE "status" = 'Pendente'
              AND ("member_id" IS NOT NULL OR "serving_group_id" IS NOT NULL)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "service_assignments"
            SET "status" = 'Pendente'
            WHERE "status" = 'Confirmada'
              AND ("member_id" IS NOT NULL OR "serving_group_id" IS NOT NULL)
        `);
    }
}
