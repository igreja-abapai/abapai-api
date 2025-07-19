import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditFieldsAndMemberFields1752943823258 implements MigrationInterface {
    name = 'AddAuditFieldsAndMemberFields1752943823258';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_code" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "verification_code" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "role" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "role" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "prayer_request" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "prayer_request" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "address" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "address" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "member" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "member" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "member" ADD "yearOfBaptism" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "placeOfBirth" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "placeOfBirth"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "yearOfBaptism"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "prayer_request" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "prayer_request" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "verification_code" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "verification_code" DROP COLUMN "created_by"`);
    }
}
