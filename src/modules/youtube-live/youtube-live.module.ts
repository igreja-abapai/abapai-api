import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeLiveCache } from './entities/youtube-live-cache.entity';
import { YoutubeApiClient } from './youtube-api.client';
import { YoutubeLiveService } from './youtube-live.service';
import { YoutubeLiveController } from './youtube-live.controller';
import { YoutubeLiveCronController } from './youtube-live-cron.controller';
import { YoutubeLiveDevPollingService } from './youtube-live-dev-polling.service';

@Module({
    imports: [TypeOrmModule.forFeature([YoutubeLiveCache])],
    providers: [YoutubeApiClient, YoutubeLiveService, YoutubeLiveDevPollingService],
    controllers: [YoutubeLiveController, YoutubeLiveCronController],
    exports: [YoutubeLiveService],
})
export class YoutubeLiveModule {}
