import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceRoleToServingGroups1781489462462 implements MigrationInterface {
    name = 'AddServiceRoleToServingGroups1781489462462';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "serving_groups"
            ADD COLUMN "service_role_id" integer
        `);

        await queryRunner.query(`
            ALTER TABLE "serving_groups"
            ADD CONSTRAINT "FK_serving_groups_service_role"
            FOREIGN KEY ("service_role_id") REFERENCES "service_roles"("id") ON DELETE RESTRICT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "serving_groups" DROP CONSTRAINT "FK_serving_groups_service_role"
        `);

        await queryRunner.query(`
            ALTER TABLE "serving_groups" DROP COLUMN "service_role_id"
        `);
    }
}
