import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAssetsPatrimony1781986959162 implements MigrationInterface {
    name = 'CreateAssetsPatrimony1781986959162';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."assets_status_enum" AS ENUM('Em uso', 'Em manutenção', 'Emprestado', 'Guardado', 'Baixado')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."assets_conservation_state_enum" AS ENUM('Bom', 'Regular', 'Ruim')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."assets_origin_enum" AS ENUM('Compra', 'Doação', 'Transferência', 'Outro')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."assets_disposal_reason_enum" AS ENUM('Quebra', 'Roubo/Furto', 'Venda', 'Doação', 'Descarte', 'Outro')`,
        );

        await queryRunner.query(
            `CREATE TABLE "asset_categories" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_asset_categories" PRIMARY KEY ("id")
            )`,
        );

        await queryRunner.query(
            `CREATE TABLE "asset_locations" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_asset_locations" PRIMARY KEY ("id")
            )`,
        );

        await queryRunner.query(
            `CREATE TABLE "assets" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "code" character varying(20) NOT NULL,
                "description" character varying(255) NOT NULL,
                "category_id" integer NOT NULL,
                "location_id" integer NOT NULL,
                "department_id" integer,
                "responsible_member_id" integer,
                "responsible_name" character varying(255),
                "quantity" integer NOT NULL DEFAULT 1,
                "acquisition_date" date,
                "acquisition_value" numeric(10,2),
                "origin" "public"."assets_origin_enum",
                "supplier_or_donor" character varying(255),
                "invoice_number" character varying(100),
                "status" "public"."assets_status_enum" NOT NULL DEFAULT 'Em uso',
                "conservation_state" "public"."assets_conservation_state_enum",
                "notes" text,
                "disposed_at" date,
                "disposal_reason" "public"."assets_disposal_reason_enum",
                "disposal_notes" text,
                CONSTRAINT "PK_assets" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_assets_code" UNIQUE ("code"),
                CONSTRAINT "FK_assets_category" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
                CONSTRAINT "FK_assets_location" FOREIGN KEY ("location_id") REFERENCES "asset_locations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
                CONSTRAINT "FK_assets_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
                CONSTRAINT "FK_assets_responsible_member" FOREIGN KEY ("responsible_member_id") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE NO ACTION
            )`,
        );

        await queryRunner.query(`CREATE INDEX "IDX_assets_status" ON "assets" ("status")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_assets_category_id" ON "assets" ("category_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_assets_location_id" ON "assets" ("location_id")`,
        );

        const categories = [
            'Mobiliário',
            'Som e Áudio',
            'Informática',
            'Eletrodomésticos',
            'Instrumentos Musicais',
            'Veículos',
            'Imóveis',
            'Outros',
        ];

        for (const name of categories) {
            await queryRunner.query(
                `INSERT INTO "asset_categories" ("name", "is_active") VALUES ('${name}', true)`,
            );
        }

        const locations = [
            'Templo',
            'Cabine de Som',
            'Sala Infantil',
            'Depósito',
            'Secretaria',
            'Externo',
        ];

        for (const name of locations) {
            await queryRunner.query(
                `INSERT INTO "asset_locations" ("name", "is_active") VALUES ('${name}', true)`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "assets"`);
        await queryRunner.query(`DROP TABLE "asset_locations"`);
        await queryRunner.query(`DROP TABLE "asset_categories"`);
        await queryRunner.query(`DROP TYPE "public"."assets_disposal_reason_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_origin_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_conservation_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_status_enum"`);
    }
}
