import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameInformaticaToEletronicosCategory1783521033220 implements MigrationInterface {
    name = 'RenameInformaticaToEletronicosCategory1783521033220';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "asset_categories"
            SET "name" = 'Eletrônicos'
            WHERE "name" = 'Informática'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "asset_categories"
            SET "name" = 'Informática'
            WHERE "name" = 'Eletrônicos'
        `);
    }
}
