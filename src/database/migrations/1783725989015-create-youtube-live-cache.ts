import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateYoutubeLiveCache1783725989015 implements MigrationInterface {
    name = 'CreateYoutubeLiveCache1783725989015';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "youtube_live_cache" (
                "id" SERIAL NOT NULL,
                "channelId" character varying NOT NULL,
                "isLive" boolean NOT NULL DEFAULT false,
                "liveVideo" jsonb,
                "upcoming" jsonb NOT NULL DEFAULT '[]',
                "nextScheduledAt" TIMESTAMP WITH TIME ZONE,
                "syncMode" character varying NOT NULL DEFAULT 'idle',
                "syncedAt" TIMESTAMP WITH TIME ZONE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_youtube_live_cache_channel_id" UNIQUE ("channelId"),
                CONSTRAINT "PK_youtube_live_cache" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "youtube_live_cache"`);
    }
}
