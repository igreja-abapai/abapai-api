import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberAddressRelationship1741543718445 implements MigrationInterface {
    name = 'AddMemberAddressRelationship1741543718445';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "addressId" integer`);
        await queryRunner.query(
            `ALTER TABLE "member" ADD CONSTRAINT "UQ_813c7d0f53916afbd1624c4e304" UNIQUE ("addressId")`,
        );
        await queryRunner.query(
            `ALTER TABLE "member" ADD CONSTRAINT "FK_813c7d0f53916afbd1624c4e304" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "member" DROP CONSTRAINT "FK_813c7d0f53916afbd1624c4e304"`,
        );
        await queryRunner.query(
            `ALTER TABLE "member" DROP CONSTRAINT "UQ_813c7d0f53916afbd1624c4e304"`,
        );
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "addressId"`);
    }
}
