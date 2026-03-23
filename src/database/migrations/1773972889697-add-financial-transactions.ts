import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinancialTransactions1773972889697 implements MigrationInterface {
    name = 'AddFinancialTransactions1773972889697';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."financial_transaction_type_enum" AS ENUM('Entrada', 'Saída')`,
        );
        await queryRunner.query(
            `CREATE TABLE "financial_transaction" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "date" date NOT NULL,
                "type" "public"."financial_transaction_type_enum" NOT NULL,
                "category" character varying(100) NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "description" character varying(255),
                CONSTRAINT "PK_416074dbe39e9f3feb05dec80cb" PRIMARY KEY ("id")
            )`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "financial_transaction"`);
        await queryRunner.query(`DROP TYPE "public"."financial_transaction_type_enum"`);
    }
}
