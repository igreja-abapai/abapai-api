import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YoutubeLiveVideo } from './interfaces/youtube-live.interfaces';

interface YoutubeSearchItem {
    id?: { videoId?: string };
    snippet?: {
        title?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
        liveBroadcastContent?: string;
    };
}

interface YoutubeVideoItem {
    id?: string;
    snippet?: {
        title?: string;
        liveBroadcastContent?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
    };
    liveStreamingDetails?: {
        scheduledStartTime?: string;
        actualStartTime?: string;
        actualEndTime?: string;
    };
}

@Injectable()
export class YoutubeApiClient {
    private readonly logger = new Logger(YoutubeApiClient.name);

    constructor(private readonly configService: ConfigService) {}

    private get apiKey(): string {
        const key = this.configService.get<string>('YOUTUBE_API_KEY');
        if (!key) {
            throw new Error('YOUTUBE_API_KEY is not configured');
        }
        return key;
    }

    async fetchLiveVideo(channelId: string): Promise<YoutubeLiveVideo | null> {
        const items = await this.search(channelId, 'live');
        if (items.length === 0) {
            return null;
        }

        const videoIds = items.map((item) => item.id?.videoId).filter(Boolean) as string[];
        const rawItems = await this.fetchRawVideoDetails(videoIds);

        for (const item of rawItems) {
            if (!this.isVideoCurrentlyLive(item)) {
                continue;
            }

            const video = this.mapVideoItem(item);
            if (video) {
                return video;
            }
        }

        return null;
    }

    async fetchUpcomingVideos(channelId: string, maxResults = 10): Promise<YoutubeLiveVideo[]> {
        const items = await this.search(channelId, 'upcoming', maxResults);
        const videoIds = items.map((item) => item.id?.videoId).filter(Boolean) as string[];
        if (videoIds.length === 0) {
            return [];
        }

        return this.fetchVideoDetails(videoIds);
    }

    async fetchVideoStatus(videoId: string): Promise<{
        isLive: boolean;
        video: YoutubeLiveVideo | null;
    }> {
        const rawItems = await this.fetchRawVideoDetails([videoId]);
        const item = rawItems[0];
        if (!item) {
            return { isLive: false, video: null };
        }

        const video = this.mapVideoItem(item);
        if (!video) {
            return { isLive: false, video: null };
        }

        return {
            isLive: this.isVideoCurrentlyLive(item),
            video: {
                ...video,
                actualStartTime:
                    item.liveStreamingDetails?.actualStartTime ?? video.actualStartTime,
            },
        };
    }

    private isVideoCurrentlyLive(item: YoutubeVideoItem): boolean {
        if (item.snippet?.liveBroadcastContent !== 'live') {
            return false;
        }

        return !item.liveStreamingDetails?.actualEndTime;
    }

    private async search(
        channelId: string,
        eventType: 'live' | 'upcoming',
        maxResults = 5,
    ): Promise<YoutubeSearchItem[]> {
        const url = new URL('https://www.googleapis.com/youtube/v3/search');
        url.searchParams.set('part', 'snippet');
        url.searchParams.set('channelId', channelId);
        url.searchParams.set('eventType', eventType);
        url.searchParams.set('type', 'video');
        url.searchParams.set('order', 'date');
        url.searchParams.set('maxResults', String(maxResults));
        url.searchParams.set('key', this.apiKey);

        const response = await fetch(url);
        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`YouTube search failed (${eventType}): ${response.status} ${body}`);
            throw new Error(`YouTube search failed with status ${response.status}`);
        }

        const data = (await response.json()) as { items?: YoutubeSearchItem[] };
        return data.items ?? [];
    }

    private async fetchVideoDetails(videoIds: string[]): Promise<YoutubeLiveVideo[]> {
        const rawItems = await this.fetchRawVideoDetails(videoIds);
        return rawItems
            .map((item) => this.mapVideoItem(item))
            .filter((video): video is YoutubeLiveVideo => video !== null);
    }

    private async fetchRawVideoDetails(videoIds: string[]): Promise<YoutubeVideoItem[]> {
        if (videoIds.length === 0) {
            return [];
        }

        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.searchParams.set('part', 'snippet,liveStreamingDetails');
        url.searchParams.set('id', videoIds.join(','));
        url.searchParams.set('key', this.apiKey);

        const response = await fetch(url);
        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`YouTube videos.list failed: ${response.status} ${body}`);
            throw new Error(`YouTube videos.list failed with status ${response.status}`);
        }

        const data = (await response.json()) as { items?: YoutubeVideoItem[] };
        return data.items ?? [];
    }

    private mapVideoItem(item: YoutubeVideoItem): YoutubeLiveVideo | null {
        const videoId = item.id;
        const title = item.snippet?.title;
        if (!videoId || !title) {
            return null;
        }

        const thumbnailUrl =
            item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url ?? null;

        return {
            videoId,
            title,
            embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&fs=1&modestbranding=1`,
            thumbnailUrl,
            scheduledStartTime: item.liveStreamingDetails?.scheduledStartTime ?? null,
            actualStartTime: item.liveStreamingDetails?.actualStartTime ?? null,
        };
    }
}
