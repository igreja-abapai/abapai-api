import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMember1741542058699 implements MigrationInterface {
    name = 'CreateMember1741542058699';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "address" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "city" character varying NOT NULL, "country" character varying NOT NULL, "district" character varying NOT NULL, "postalCode" character varying, "streetName" character varying NOT NULL, "streetNumber" character varying NOT NULL, "state" character varying NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."member_gender_enum" AS ENUM('Masculino', 'Feminino')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."member_maritalstatus_enum" AS ENUM('Solteiro', 'Casado', 'Divorciado', 'Viúvo')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."member_educationlevel_enum" AS ENUM('Ensino Fundamental', 'Ensino Médio', 'Curso Técnico', 'Ensino Superior', 'Pós-Graduação', 'Mestrado', 'Doutorado', 'Outro')`,
        );
        await queryRunner.query(
            `CREATE TABLE "member" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "gender" "public"."member_gender_enum" NOT NULL, "birthdate" date NOT NULL, "nationality" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying, "maritalStatus" "public"."member_maritalstatus_enum" NOT NULL, "spouseName" character varying, "educationLevel" "public"."member_educationlevel_enum" NOT NULL, "yearOfConversion" character varying, "occupation" character varying NOT NULL, "rg" character varying NOT NULL, "issuingBody" character varying NOT NULL, "cpf" character varying NOT NULL, "lastChurch" character varying, "lastPositionHeld" character varying, "isBaptized" boolean NOT NULL, "isBaptizedInTheHolySpirit" boolean, "currentPosition" character varying, "wantsToBeAVolunteer" boolean, "areaOfInterest" character varying, CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "prayer_request" ALTER COLUMN "name" SET DEFAULT 'Anônimo'`,
        );
        await queryRunner.query(`ALTER TABLE "prayer_request" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "prayer_request" ALTER COLUMN "area" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prayer_request" ALTER COLUMN "area" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "prayer_request" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "prayer_request" ALTER COLUMN "name" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "member"`);
        await queryRunner.query(`DROP TYPE "public"."member_educationlevel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."member_maritalstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."member_gender_enum"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }
}
