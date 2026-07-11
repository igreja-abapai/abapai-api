export interface YoutubeLiveVideo {
    videoId: string;
    title: string;
    embedUrl: string;
    thumbnailUrl: string | null;
    scheduledStartTime: string | null;
    actualStartTime: string | null;
}

export interface YoutubeLiveCurrentResponse {
    isLive: boolean;
    liveVideo: YoutubeLiveVideo | null;
    upcoming: YoutubeLiveVideo[];
    nextScheduledAt: string | null;
    syncedAt: string | null;
}
