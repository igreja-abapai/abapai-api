import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migrates service_roles_category_enum to the five worship ministry categories.
 */
export class UpdateServiceRoleCategoryEnum1781463632167 implements MigrationInterface {
    name = 'UpdateServiceRoleCategoryEnum1781463632167';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasOldValues: Array<{ exists: boolean }> = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'service_roles_category_enum'
                  AND e.enumlabel IN ('Culto', 'Mídia', 'Geral')
            ) AS "exists"
        `);

        if (!hasOldValues[0]?.exists) {
            return;
        }

        await queryRunner.query(`
            CREATE TYPE "public"."service_roles_category_enum_new" AS ENUM(
                'Direção & Palavra',
                'Louvor',
                'Mídia & Som',
                'Recepção',
                'Apoio & Cuidado'
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "service_roles"
            ALTER COLUMN "category" DROP DEFAULT
        `);

        await queryRunner.query(`
            ALTER TABLE "service_roles"
            ALTER COLUMN "category" TYPE "public"."service_roles_category_enum_new"
            USING (
                CASE "category"::text
                    WHEN 'Culto' THEN 'Direção & Palavra'::"public"."service_roles_category_enum_new"
                    WHEN 'Mídia' THEN 'Mídia & Som'::"public"."service_roles_category_enum_new"
                    WHEN 'Geral' THEN 'Apoio & Cuidado'::"public"."service_roles_category_enum_new"
                    WHEN 'Recepção' THEN 'Recepção'::"public"."service_roles_category_enum_new"
                    WHEN 'Direção & Palavra' THEN 'Direção & Palavra'::"public"."service_roles_category_enum_new"
                    WHEN 'Louvor' THEN 'Louvor'::"public"."service_roles_category_enum_new"
                    WHEN 'Mídia & Som' THEN 'Mídia & Som'::"public"."service_roles_category_enum_new"
                    WHEN 'Apoio & Cuidado' THEN 'Apoio & Cuidado'::"public"."service_roles_category_enum_new"
                    ELSE 'Apoio & Cuidado'::"public"."service_roles_category_enum_new"
                END
            )
        `);

        await queryRunner.query(`DROP TYPE "public"."service_roles_category_enum"`);
        await queryRunner.query(
            `ALTER TYPE "public"."service_roles_category_enum_new" RENAME TO "service_roles_category_enum"`,
        );

        await queryRunner.query(`
            ALTER TABLE "service_roles"
            ALTER COLUMN "category" SET DEFAULT 'Apoio & Cuidado'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasNewValues: Array<{ exists: boolean }> = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'service_roles_category_enum'
                  AND e.enumlabel = 'Direção & Palavra'
            ) AS "exists"
        `);

        if (!hasNewValues[0]?.exists) {
            return;
        }

        await queryRunner.query(`
            CREATE TYPE "public"."service_roles_category_enum_old" AS ENUM(
                'Culto',
                'Recepção',
                'Mídia',
                'Geral'
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "service_roles"
            ALTER COLUMN "category" DROP DEFAULT
        `);

        await queryRunner.query(`
            ALTER TABLE "service_roles"
            ALTER COLUMN "category" TYPE "public"."service_roles_category_enum_old"
            USING (
                CASE "category"::text
                    WHEN 'Direção & Palavra' THEN 'Culto'::"public"."service_roles_category_enum_old"
                    WHEN 'Louvor' THEN 'Culto'::"public"."service_roles_category_enum_old"
                    WHEN 'Mídia & Som' THEN 'Mídia'::"public"."service_roles_category_enum_old"
                    WHEN 'Recepção' THEN 'Recepção'::"public"."service_roles_category_enum_old"
                    WHEN 'Apoio & Cuidado' THEN 'Geral'::"public"."service_roles_category_enum_old"
                    ELSE 'Geral'::"public"."service_roles_category_enum_old"
                END
            )
        `);

        await queryRunner.query(`DROP TYPE "public"."service_roles_category_enum"`);
        await queryRunner.query(
            `ALTER TYPE "public"."service_roles_category_enum_old" RENAME TO "service_roles_category_enum"`,
        );

        await queryRunner.query(`
            ALTER TABLE "service_roles"
            ALTER COLUMN "category" SET DEFAULT 'Geral'
        `);
    }
}
