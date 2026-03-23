import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migrates financial_transaction_type_enum from English (INCOME/EXPENSE) to Portuguese
 * (Entrada/Saída). Skips if the enum already only has Portuguese labels.
 */
export class MigrateFinancialTransactionEnumToPortuguese1773972892000
    implements MigrationInterface
{
    name = 'MigrateFinancialTransactionEnumToPortuguese1773972892000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasEnglish: Array<{ exists: boolean }> = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'financial_transaction_type_enum'
                  AND e.enumlabel IN ('INCOME', 'EXPENSE')
            ) AS "exists"
        `);

        if (!hasEnglish[0]?.exists) {
            return;
        }

        await queryRunner.query(
            `CREATE TYPE "public"."financial_transaction_type_enum_new" AS ENUM('Entrada', 'Saída')`,
        );

        await queryRunner.query(`
            ALTER TABLE "financial_transaction"
            ALTER COLUMN "type" DROP DEFAULT
        `);

        await queryRunner.query(`
            ALTER TABLE "financial_transaction"
            ALTER COLUMN "type" TYPE "public"."financial_transaction_type_enum_new"
            USING (
                CASE "type"::text
                    WHEN 'INCOME' THEN 'Entrada'::"public"."financial_transaction_type_enum_new"
                    WHEN 'EXPENSE' THEN 'Saída'::"public"."financial_transaction_type_enum_new"
                    WHEN 'Entrada' THEN 'Entrada'::"public"."financial_transaction_type_enum_new"
                    WHEN 'Saída' THEN 'Saída'::"public"."financial_transaction_type_enum_new"
                    ELSE 'Entrada'::"public"."financial_transaction_type_enum_new"
                END
            )
        `);

        await queryRunner.query(`DROP TYPE "public"."financial_transaction_type_enum"`);
        await queryRunner.query(
            `ALTER TYPE "public"."financial_transaction_type_enum_new" RENAME TO "financial_transaction_type_enum"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasPortuguese: Array<{ exists: boolean }> = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'financial_transaction_type_enum'
                  AND e.enumlabel IN ('Entrada', 'Saída')
            ) AS "exists"
        `);

        if (!hasPortuguese[0]?.exists) {
            return;
        }

        await queryRunner.query(
            `CREATE TYPE "public"."financial_transaction_type_enum_old" AS ENUM('INCOME', 'EXPENSE')`,
        );

        await queryRunner.query(`
            ALTER TABLE "financial_transaction"
            ALTER COLUMN "type" TYPE "public"."financial_transaction_type_enum_old"
            USING (
                CASE "type"::text
                    WHEN 'Entrada' THEN 'INCOME'::"public"."financial_transaction_type_enum_old"
                    WHEN 'Saída' THEN 'EXPENSE'::"public"."financial_transaction_type_enum_old"
                    ELSE 'INCOME'::"public"."financial_transaction_type_enum_old"
                END
            )
        `);

        await queryRunner.query(`DROP TYPE "public"."financial_transaction_type_enum"`);
        await queryRunner.query(
            `ALTER TYPE "public"."financial_transaction_type_enum_old" RENAME TO "financial_transaction_type_enum"`,
        );
    }
}
