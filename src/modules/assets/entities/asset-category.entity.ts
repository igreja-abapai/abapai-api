import { Column, Entity, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Asset } from './asset.entity';

@Entity('asset_categories')
export class AssetCategory extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => Asset, (asset) => asset.category)
    assets: Asset[];
}
