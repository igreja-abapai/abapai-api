import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotification1753228273206 implements MigrationInterface {
    name = 'CreateNotification1753228273206';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "notification" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "message" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'info', "data" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "notification_recipients" ("notificationId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_53cfd1bfedccc676fd6d74137bb" PRIMARY KEY ("notificationId", "userId"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_234adaa36f97dd1b2bd3a22d65" ON "notification_recipients" ("notificationId") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_452385a8220b8053ab65317ffa" ON "notification_recipients" ("userId") `,
        );
        await queryRunner.query(
            `CREATE TABLE "notification_read_by" ("notificationId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_00fbac80c5d8cf41242442c9554" PRIMARY KEY ("notificationId", "userId"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_b83c4c5b7b585c718a2dfb5d2b" ON "notification_read_by" ("notificationId") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_5b5c4ad81469788ab783b17bf9" ON "notification_read_by" ("userId") `,
        );
        await queryRunner.query(
            `ALTER TABLE "notification_recipients" ADD CONSTRAINT "FK_234adaa36f97dd1b2bd3a22d65b" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "notification_recipients" ADD CONSTRAINT "FK_452385a8220b8053ab65317ffa6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "notification_read_by" ADD CONSTRAINT "FK_b83c4c5b7b585c718a2dfb5d2bc" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "notification_read_by" ADD CONSTRAINT "FK_5b5c4ad81469788ab783b17bf98" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "notification_read_by" DROP CONSTRAINT "FK_5b5c4ad81469788ab783b17bf98"`,
        );
        await queryRunner.query(
            `ALTER TABLE "notification_read_by" DROP CONSTRAINT "FK_b83c4c5b7b585c718a2dfb5d2bc"`,
        );
        await queryRunner.query(
            `ALTER TABLE "notification_recipients" DROP CONSTRAINT "FK_452385a8220b8053ab65317ffa6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "notification_recipients" DROP CONSTRAINT "FK_234adaa36f97dd1b2bd3a22d65b"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_5b5c4ad81469788ab783b17bf9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b83c4c5b7b585c718a2dfb5d2b"`);
        await queryRunner.query(`DROP TABLE "notification_read_by"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_452385a8220b8053ab65317ffa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_234adaa36f97dd1b2bd3a22d65"`);
        await queryRunner.query(`DROP TABLE "notification_recipients"`);
        await queryRunner.query(`DROP TABLE "notification"`);
    }
}
