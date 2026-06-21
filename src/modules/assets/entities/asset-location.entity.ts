import { Column, Entity, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Asset } from './asset.entity';

@Entity('asset_locations')
export class AssetLocation extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => Asset, (asset) => asset.location)
    assets: Asset[];
}
