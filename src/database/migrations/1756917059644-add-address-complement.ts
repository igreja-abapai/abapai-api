import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressComplement1756917059644 implements MigrationInterface {
    name = 'AddAddressComplement1756917059644';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" ADD "complement" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "complement"`);
    }
}
