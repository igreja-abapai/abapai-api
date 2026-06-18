import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestAssignmentSupport1781751674315 implements MigrationInterface {
    name = 'AddGuestAssignmentSupport1781751674315';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "service_roles"
            ADD COLUMN "allows_guest_assignment" boolean NOT NULL DEFAULT false
        `);

        await queryRunner.query(`
            ALTER TABLE "service_assignments"
            ADD COLUMN "guest_name" character varying(255)
        `);

        await queryRunner.query(`
            UPDATE "service_roles"
            SET "allows_guest_assignment" = true
            WHERE LOWER("name") LIKE '%pregador%'
        `);

        await queryRunner.query(`
            UPDATE "service_assignments"
            SET "status" = 'Confirmada'
            WHERE "guest_name" IS NOT NULL AND TRIM("guest_name") <> ''
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "service_assignments" DROP COLUMN "guest_name"
        `);

        await queryRunner.query(`
            ALTER TABLE "service_roles" DROP COLUMN "allows_guest_assignment"
        `);
    }
}
