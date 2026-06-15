import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationTables1781378982046 implements MigrationInterface {
    name = 'CreateOrganizationTables1781378982046';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."departments_type_enum" AS ENUM('Departamento', 'Ministério')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."member_departments_role_enum" AS ENUM('Líder', 'Membro', 'Auxiliar')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."service_roles_category_enum" AS ENUM('Culto', 'Recepção', 'Mídia', 'Geral')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."member_service_capabilities_source_enum" AS ENUM('Manual', 'Departamento')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."worship_service_types_default_weekday_enum" AS ENUM('Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."worship_services_status_enum" AS ENUM('Rascunho', 'Publicada', 'Concluída')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."service_assignments_status_enum" AS ENUM('Vaga', 'Pendente', 'Confirmada', 'Recusada')`,
        );

        await queryRunner.query(`
            CREATE TABLE "departments" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying NOT NULL,
                "type" "public"."departments_type_enum" NOT NULL DEFAULT 'Departamento',
                "description" text,
                "parent_id" integer,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_departments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_departments_parent" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "service_roles" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying NOT NULL,
                "category" "public"."service_roles_category_enum" NOT NULL DEFAULT 'Geral',
                "description" text,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_service_roles" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "member_departments" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "member_id" integer NOT NULL,
                "department_id" integer NOT NULL,
                "role" "public"."member_departments_role_enum" NOT NULL DEFAULT 'Membro',
                "started_at" date,
                "ended_at" date,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_member_departments" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_member_departments_member_department" UNIQUE ("member_id", "department_id"),
                CONSTRAINT "FK_member_departments_member" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_member_departments_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "department_role_eligibility" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "department_id" integer NOT NULL,
                "service_role_id" integer NOT NULL,
                "is_default" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_department_role_eligibility" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_department_role_eligibility" UNIQUE ("department_id", "service_role_id"),
                CONSTRAINT "FK_department_role_eligibility_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_department_role_eligibility_service_role" FOREIGN KEY ("service_role_id") REFERENCES "service_roles"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "member_service_capabilities" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "member_id" integer NOT NULL,
                "service_role_id" integer NOT NULL,
                "source" "public"."member_service_capabilities_source_enum" NOT NULL DEFAULT 'Manual',
                "is_active" boolean NOT NULL DEFAULT true,
                "notes" text,
                "valid_from" date,
                "valid_to" date,
                CONSTRAINT "PK_member_service_capabilities" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_member_service_capabilities" UNIQUE ("member_id", "service_role_id"),
                CONSTRAINT "FK_member_service_capabilities_member" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_member_service_capabilities_service_role" FOREIGN KEY ("service_role_id") REFERENCES "service_roles"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "serving_groups" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying NOT NULL,
                "notes" text,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_serving_groups" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "serving_group_members" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "serving_group_id" integer NOT NULL,
                "member_id" integer NOT NULL,
                CONSTRAINT "PK_serving_group_members" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_serving_group_members" UNIQUE ("serving_group_id", "member_id"),
                CONSTRAINT "FK_serving_group_members_group" FOREIGN KEY ("serving_group_id") REFERENCES "serving_groups"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_serving_group_members_member" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "worship_service_types" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "name" character varying NOT NULL,
                "description" text,
                "default_weekday" "public"."worship_service_types_default_weekday_enum",
                "default_time" character varying(5),
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_worship_service_types" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "worship_service_type_roles" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "worship_service_type_id" integer NOT NULL,
                "service_role_id" integer NOT NULL,
                "quantity" integer NOT NULL DEFAULT 1,
                "is_required" boolean NOT NULL DEFAULT true,
                "sort_order" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_worship_service_type_roles" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_worship_service_type_roles" UNIQUE ("worship_service_type_id", "service_role_id"),
                CONSTRAINT "FK_worship_service_type_roles_type" FOREIGN KEY ("worship_service_type_id") REFERENCES "worship_service_types"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_worship_service_type_roles_role" FOREIGN KEY ("service_role_id") REFERENCES "service_roles"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "worship_services" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "worship_service_type_id" integer,
                "scheduled_at" TIMESTAMP NOT NULL,
                "name" character varying(255),
                "status" "public"."worship_services_status_enum" NOT NULL DEFAULT 'Rascunho',
                "notes" text,
                "published_by" integer,
                "published_at" TIMESTAMP,
                CONSTRAINT "PK_worship_services" PRIMARY KEY ("id"),
                CONSTRAINT "FK_worship_services_type" FOREIGN KEY ("worship_service_type_id") REFERENCES "worship_service_types"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "service_assignments" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" integer,
                "updated_by" integer,
                "worship_service_id" integer NOT NULL,
                "service_role_id" integer NOT NULL,
                "slot_number" integer NOT NULL DEFAULT 1,
                "member_id" integer,
                "serving_group_id" integer,
                "status" "public"."service_assignments_status_enum" NOT NULL DEFAULT 'Vaga',
                "assigned_by" integer,
                "assigned_at" TIMESTAMP,
                "notes" text,
                CONSTRAINT "PK_service_assignments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_service_assignments_worship_service" FOREIGN KEY ("worship_service_id") REFERENCES "worship_services"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_service_assignments_service_role" FOREIGN KEY ("service_role_id") REFERENCES "service_roles"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_service_assignments_member" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_service_assignments_serving_group" FOREIGN KEY ("serving_group_id") REFERENCES "serving_groups"("id") ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "service_assignments"`);
        await queryRunner.query(`DROP TABLE "worship_services"`);
        await queryRunner.query(`DROP TABLE "worship_service_type_roles"`);
        await queryRunner.query(`DROP TABLE "worship_service_types"`);
        await queryRunner.query(`DROP TABLE "serving_group_members"`);
        await queryRunner.query(`DROP TABLE "serving_groups"`);
        await queryRunner.query(`DROP TABLE "member_service_capabilities"`);
        await queryRunner.query(`DROP TABLE "department_role_eligibility"`);
        await queryRunner.query(`DROP TABLE "member_departments"`);
        await queryRunner.query(`DROP TABLE "service_roles"`);
        await queryRunner.query(`DROP TABLE "departments"`);
        await queryRunner.query(`DROP TYPE "public"."service_assignments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."worship_services_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."worship_service_types_default_weekday_enum"`);
        await queryRunner.query(`DROP TYPE "public"."member_service_capabilities_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."service_roles_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."member_departments_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."departments_type_enum"`);
    }
}
