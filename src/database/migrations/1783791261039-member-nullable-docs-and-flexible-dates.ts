import { MigrationInterface, QueryRunner } from 'typeorm';

export class MemberNullableDocsAndFlexibleDates1783791261039 implements MigrationInterface {
    name = 'MemberNullableDocsAndFlexibleDates1783791261039';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "cpf" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "rg" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "issuingBody" DROP NOT NULL`);

        await queryRunner.query(
            `ALTER TABLE "member" RENAME COLUMN "yearOfConversion" TO "conversionDate"`,
        );
        await queryRunner.query(
            `ALTER TABLE "member" RENAME COLUMN "yearOfBaptism" TO "baptismDate"`,
        );

        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "conversionDate" TYPE text`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "baptismDate" TYPE text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "member" ALTER COLUMN "baptismDate" TYPE character varying`,
        );
        await queryRunner.query(
            `ALTER TABLE "member" ALTER COLUMN "conversionDate" TYPE character varying`,
        );

        await queryRunner.query(
            `ALTER TABLE "member" RENAME COLUMN "baptismDate" TO "yearOfBaptism"`,
        );
        await queryRunner.query(
            `ALTER TABLE "member" RENAME COLUMN "conversionDate" TO "yearOfConversion"`,
        );

        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "issuingBody" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "rg" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "cpf" SET NOT NULL`);
    }
}
