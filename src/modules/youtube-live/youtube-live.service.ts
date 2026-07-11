import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YoutubeLiveCache } from './entities/youtube-live-cache.entity';
import { YoutubeLiveSyncMode } from './enums/youtube-live-sync-mode.enum';
import { YoutubeLiveCurrentResponse, YoutubeLiveVideo } from './interfaces/youtube-live.interfaces';
import { YoutubeApiClient } from './youtube-api.client';

const IDLE_REFRESH_MS = 6 * 60 * 60 * 1000;
const WATCHING_WINDOW_BEFORE_MS = 30 * 60 * 1000;
const WATCHING_WINDOW_AFTER_MS = 2 * 60 * 60 * 1000;
const STALE_ON_READ_MS = 5 * 60 * 1000;

@Injectable()
export class YoutubeLiveService {
    private readonly logger = new Logger(YoutubeLiveService.name);

    constructor(
        @InjectRepository(YoutubeLiveCache)
        private readonly cacheRepository: Repository<YoutubeLiveCache>,
        private readonly configService: ConfigService,
        private readonly youtubeApiClient: YoutubeApiClient,
    ) {}

    getChannelId(): string {
        const channelId = this.configService.get<string>('YOUTUBE_LIVE_CHANNEL_ID');
        if (!channelId) {
            throw new Error('YOUTUBE_LIVE_CHANNEL_ID is not configured');
        }
        return channelId;
    }

    private isConfigured(): boolean {
        return Boolean(
            this.configService.get<string>('YOUTUBE_API_KEY') &&
                this.configService.get<string>('YOUTUBE_LIVE_CHANNEL_ID'),
        );
    }

    private emptyResponse(): YoutubeLiveCurrentResponse {
        return {
            isLive: false,
            liveVideo: null,
            upcoming: [],
            nextScheduledAt: null,
            syncedAt: null,
        };
    }

    async getCurrent(forceRefresh = false): Promise<YoutubeLiveCurrentResponse> {
        if (!this.isConfigured()) {
            return this.emptyResponse();
        }

        const channelId = this.getChannelId();
        let cache = await this.findOrCreateCache(channelId);

        if (forceRefresh || this.shouldRefreshOnRead(cache)) {
            cache = await this.syncCache(cache);
        }

        return this.toResponse(cache);
    }

    async syncFromCron(): Promise<{
        ok: boolean;
        skipped: boolean;
        syncMode: YoutubeLiveSyncMode;
        isLive: boolean;
        upcomingCount: number;
    }> {
        if (!this.isConfigured()) {
            return {
                ok: false,
                skipped: true,
                syncMode: YoutubeLiveSyncMode.IDLE,
                isLive: false,
                upcomingCount: 0,
            };
        }

        const channelId = this.getChannelId();
        const cache = await this.findOrCreateCache(channelId);

        if (!this.shouldSyncFromCron(cache)) {
            return {
                ok: true,
                skipped: true,
                syncMode: cache.syncMode,
                isLive: cache.isLive,
                upcomingCount: cache.upcoming.length,
            };
        }

        const updated = await this.syncCache(cache);
        return {
            ok: true,
            skipped: false,
            syncMode: updated.syncMode,
            isLive: updated.isLive,
            upcomingCount: updated.upcoming.length,
        };
    }

    async forceSync(): Promise<{
        ok: boolean;
        syncMode: YoutubeLiveSyncMode;
        isLive: boolean;
        upcomingCount: number;
    }> {
        if (!this.isConfigured()) {
            return {
                ok: false,
                syncMode: YoutubeLiveSyncMode.IDLE,
                isLive: false,
                upcomingCount: 0,
            };
        }

        const channelId = this.getChannelId();
        const cache = await this.findOrCreateCache(channelId);
        const updated = await this.syncCache(cache);

        return {
            ok: true,
            syncMode: updated.syncMode,
            isLive: updated.isLive,
            upcomingCount: updated.upcoming.length,
        };
    }

    private async findOrCreateCache(channelId: string): Promise<YoutubeLiveCache> {
        let cache = await this.cacheRepository.findOne({ where: { channelId } });
        if (!cache) {
            cache = this.cacheRepository.create({
                channelId,
                isLive: false,
                liveVideo: null,
                upcoming: [],
                nextScheduledAt: null,
                syncMode: YoutubeLiveSyncMode.IDLE,
                syncedAt: null,
            });
            cache = await this.cacheRepository.save(cache);
        }
        return cache;
    }

    private shouldRefreshOnRead(cache: YoutubeLiveCache): boolean {
        if (!cache.syncedAt) {
            return true;
        }

        const age = Date.now() - cache.syncedAt.getTime();
        if (cache.syncMode === YoutubeLiveSyncMode.LIVE) {
            return age >= 60 * 1000;
        }
        if (cache.syncMode === YoutubeLiveSyncMode.WATCHING) {
            return age >= STALE_ON_READ_MS;
        }
        return age >= IDLE_REFRESH_MS;
    }

    private shouldSyncFromCron(cache: YoutubeLiveCache): boolean {
        if (!cache.syncedAt) {
            return true;
        }

        const age = Date.now() - cache.syncedAt.getTime();

        if (cache.syncMode === YoutubeLiveSyncMode.LIVE) {
            return age >= 2 * 60 * 1000;
        }

        if (cache.syncMode === YoutubeLiveSyncMode.WATCHING) {
            return age >= 3 * 60 * 1000;
        }

        return age >= IDLE_REFRESH_MS;
    }

    private async syncCache(cache: YoutubeLiveCache): Promise<YoutubeLiveCache> {
        try {
            if (cache.syncMode === YoutubeLiveSyncMode.LIVE && cache.liveVideo?.videoId) {
                const status = await this.youtubeApiClient.fetchVideoStatus(
                    cache.liveVideo.videoId,
                );
                if (status.isLive && status.video) {
                    let upcoming = cache.upcoming;
                    if (upcoming.length === 0) {
                        upcoming = this.excludeVideoFromUpcoming(
                            await this.youtubeApiClient.fetchUpcomingVideos(cache.channelId),
                            status.video.videoId,
                        );
                    }

                    return this.saveCache(cache, {
                        isLive: true,
                        liveVideo: status.video,
                        upcoming,
                        syncMode: YoutubeLiveSyncMode.LIVE,
                    });
                }

                const upcoming = await this.youtubeApiClient.fetchUpcomingVideos(cache.channelId);
                const nextScheduledAt = this.resolveNextScheduledAt(upcoming);
                const syncMode = this.resolveSyncMode(nextScheduledAt);

                return this.saveCache(cache, {
                    isLive: false,
                    liveVideo: null,
                    upcoming,
                    nextScheduledAt,
                    syncMode,
                });
            }

            const liveVideo = await this.youtubeApiClient.fetchLiveVideo(cache.channelId);
            if (liveVideo) {
                const upcoming = await this.youtubeApiClient.fetchUpcomingVideos(cache.channelId);
                const filteredUpcoming = this.excludeVideoFromUpcoming(upcoming, liveVideo.videoId);

                return this.saveCache(cache, {
                    isLive: true,
                    liveVideo,
                    upcoming: filteredUpcoming,
                    nextScheduledAt: this.resolveNextScheduledAt(filteredUpcoming),
                    syncMode: YoutubeLiveSyncMode.LIVE,
                });
            }

            const upcoming = await this.youtubeApiClient.fetchUpcomingVideos(cache.channelId);
            const nextScheduledAt = this.resolveNextScheduledAt(upcoming);
            const syncMode = this.resolveSyncMode(nextScheduledAt);

            return this.saveCache(cache, {
                isLive: false,
                liveVideo: null,
                upcoming,
                nextScheduledAt,
                syncMode,
            });
        } catch (error) {
            this.logger.error('Failed to sync YouTube live cache', error as Error);
            throw error;
        }
    }

    private resolveNextScheduledAt(upcoming: YoutubeLiveVideo[]): Date | null {
        const timestamps = upcoming
            .map((video) => video.scheduledStartTime)
            .filter((value): value is string => Boolean(value))
            .map((value) => new Date(value).getTime())
            .filter((value) => Number.isFinite(value) && value > Date.now());

        if (timestamps.length === 0) {
            return null;
        }

        return new Date(Math.min(...timestamps));
    }

    private excludeVideoFromUpcoming(
        upcoming: YoutubeLiveVideo[],
        videoId: string,
    ): YoutubeLiveVideo[] {
        return upcoming.filter((video) => video.videoId !== videoId);
    }

    private resolveSyncMode(nextScheduledAt: Date | null): YoutubeLiveSyncMode {
        if (!nextScheduledAt) {
            return YoutubeLiveSyncMode.IDLE;
        }

        const now = Date.now();
        const start = nextScheduledAt.getTime();
        if (now >= start - WATCHING_WINDOW_BEFORE_MS && now <= start + WATCHING_WINDOW_AFTER_MS) {
            return YoutubeLiveSyncMode.WATCHING;
        }

        return YoutubeLiveSyncMode.IDLE;
    }

    private async saveCache(
        cache: YoutubeLiveCache,
        data: {
            isLive: boolean;
            liveVideo: YoutubeLiveVideo | null;
            upcoming: YoutubeLiveVideo[];
            nextScheduledAt?: Date | null;
            syncMode: YoutubeLiveSyncMode;
        },
    ): Promise<YoutubeLiveCache> {
        cache.isLive = data.isLive;
        cache.liveVideo = data.liveVideo;
        cache.upcoming = data.upcoming;
        cache.nextScheduledAt =
            data.nextScheduledAt !== undefined
                ? data.nextScheduledAt
                : this.resolveNextScheduledAt(data.upcoming);
        cache.syncMode = data.syncMode;
        cache.syncedAt = new Date();
        return this.cacheRepository.save(cache);
    }

    private toResponse(cache: YoutubeLiveCache): YoutubeLiveCurrentResponse {
        return {
            isLive: cache.isLive,
            liveVideo: cache.liveVideo,
            upcoming: cache.upcoming,
            nextScheduledAt: cache.nextScheduledAt?.toISOString() ?? null,
            syncedAt: cache.syncedAt?.toISOString() ?? null,
        };
    }
}
