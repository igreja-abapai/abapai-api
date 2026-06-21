import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Asset } from './asset.entity';

@Entity('asset_attachments')
export class AssetAttachment extends IdTimestampBaseEntity {
    @Column({ name: 'asset_id' })
    assetId: number;

    @ManyToOne(() => Asset, (asset) => asset.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @Column({ name: 'file_name', type: 'varchar', length: 255 })
    fileName: string;

    @Column({ name: 'file_url', type: 'varchar', length: 500 })
    fileUrl: string;

    @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
    mimeType: string | null;

    @Column({ name: 'file_size', type: 'int', nullable: true })
    fileSize: number | null;
}
