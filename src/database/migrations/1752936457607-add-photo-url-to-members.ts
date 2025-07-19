import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoUrlToMembers1752936457607 implements MigrationInterface {
    name = 'AddPhotoUrlToMembers1752936457607';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "photoUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "photoUrl"`);
    }
}
