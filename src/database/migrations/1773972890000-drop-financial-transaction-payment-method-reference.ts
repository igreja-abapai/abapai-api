import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes paymentMethod and reference if they exist (databases that ran an older
 * version of 1773972889697-add-financial-transactions). Safe on fresh DBs where those
 * columns were never created.
 */
export class DropFinancialTransactionPaymentMethodReference1773972890000
    implements MigrationInterface
{
    name = 'DropFinancialTransactionPaymentMethodReference1773972890000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "financial_transaction" DROP COLUMN IF EXISTS "paymentMethod"`,
        );
        await queryRunner.query(
            `ALTER TABLE "financial_transaction" DROP COLUMN IF EXISTS "reference"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "financial_transaction" ADD "paymentMethod" character varying(100)`,
        );
        await queryRunner.query(
            `ALTER TABLE "financial_transaction" ADD "reference" character varying(100)`,
        );
    }
}
