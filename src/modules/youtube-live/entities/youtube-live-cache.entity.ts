import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { YoutubeLiveSyncMode } from '../enums/youtube-live-sync-mode.enum';
import { YoutubeLiveVideo } from '../interfaces/youtube-live.interfaces';

@Entity('youtube_live_cache')
export class YoutubeLiveCache {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', unique: true })
    channelId: string;

    @Column({ type: 'boolean', default: false })
    isLive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    liveVideo: YoutubeLiveVideo | null;

    @Column({ type: 'jsonb', default: [] })
    upcoming: YoutubeLiveVideo[];

    @Column({ type: 'timestamptz', nullable: true })
    nextScheduledAt: Date | null;

    @Column({
        type: 'varchar',
        default: YoutubeLiveSyncMode.IDLE,
    })
    syncMode: YoutubeLiveSyncMode;

    @Column({ type: 'timestamptz', nullable: true })
    syncedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
