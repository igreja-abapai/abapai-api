import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitWorshipServiceTypeRoleSlots1782069681282 implements MigrationInterface {
    name = 'SplitWorshipServiceTypeRoleSlots1782069681282';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "worship_service_type_roles"
            ADD COLUMN "slot_number" integer NOT NULL DEFAULT 1
        `);

        await queryRunner.query(`
            ALTER TABLE "worship_service_type_roles"
            DROP CONSTRAINT "UQ_worship_service_type_roles"
        `);

        const rows: Array<{
            id: number;
            worship_service_type_id: number;
            service_role_id: number;
            quantity: number;
            is_required: boolean;
            sort_order: number;
            created_by: number | null;
            updated_by: number | null;
        }> = await queryRunner.query(`
            SELECT id, worship_service_type_id, service_role_id, quantity, is_required, sort_order, created_by, updated_by
            FROM "worship_service_type_roles"
            WHERE quantity > 1
        `);

        for (const row of rows) {
            for (let slot = 2; slot <= row.quantity; slot++) {
                await queryRunner.query(
                    `
                    INSERT INTO "worship_service_type_roles" (
                        worship_service_type_id,
                        service_role_id,
                        quantity,
                        is_required,
                        sort_order,
                        slot_number,
                        created_by,
                        updated_by
                    )
                    VALUES ($1, $2, 1, $3, $4, $5, $6, $7)
                `,
                    [
                        row.worship_service_type_id,
                        row.service_role_id,
                        row.is_required,
                        row.sort_order,
                        slot,
                        row.created_by,
                        row.updated_by,
                    ],
                );
            }

            await queryRunner.query(
                `
                UPDATE "worship_service_type_roles"
                SET quantity = 1, slot_number = 1
                WHERE id = $1
            `,
                [row.id],
            );
        }

        await queryRunner.query(`
            ALTER TABLE "worship_service_type_roles"
            ADD CONSTRAINT "UQ_worship_service_type_roles_slot"
            UNIQUE ("worship_service_type_id", "service_role_id", "slot_number")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "worship_service_type_roles"
            DROP CONSTRAINT "UQ_worship_service_type_roles_slot"
        `);

        await queryRunner.query(`
            ALTER TABLE "worship_service_type_roles"
            ADD CONSTRAINT "UQ_worship_service_type_roles"
            UNIQUE ("worship_service_type_id", "service_role_id")
        `);

        await queryRunner.query(`
            ALTER TABLE "worship_service_type_roles"
            DROP COLUMN "slot_number"
        `);
    }
}
