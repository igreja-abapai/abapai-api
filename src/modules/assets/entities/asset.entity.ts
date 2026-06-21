import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Member } from '../../member/entities/member.entity';
import { Department } from '../../organization/entities/department.entity';
import { AssetConservationState } from '../enums/asset-conservation-state.enum';
import { AssetDisposalReason } from '../enums/asset-disposal-reason.enum';
import { AssetOrigin } from '../enums/asset-origin.enum';
import { AssetStatus } from '../enums/asset-status.enum';
import { AssetCategory } from './asset-category.entity';
import { AssetLocation } from './asset-location.entity';
import { AssetAttachment } from './asset-attachment.entity';

@Entity('assets')
export class Asset extends IdTimestampBaseEntity {
    @Column({ unique: true, length: 20 })
    code: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
    photoUrl: string | null;

    @Column({ name: 'category_id' })
    categoryId: number;

    @ManyToOne(() => AssetCategory, (category) => category.assets, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'category_id' })
    category: AssetCategory;

    @Column({ name: 'location_id' })
    locationId: number;

    @ManyToOne(() => AssetLocation, (location) => location.assets, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'location_id' })
    location: AssetLocation;

    @Column({ name: 'department_id', nullable: true })
    departmentId: number | null;

    @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'department_id' })
    department: Department | null;

    @Column({ name: 'responsible_member_id', nullable: true })
    responsibleMemberId: number | null;

    @ManyToOne(() => Member, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'responsible_member_id' })
    responsibleMember: Member | null;

    @Column({ name: 'responsible_name', type: 'varchar', length: 255, nullable: true })
    responsibleName: string | null;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ name: 'acquisition_date', type: 'date', nullable: true })
    acquisitionDate: Date | null;

    @Column({ name: 'acquisition_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
    acquisitionValue: string | null;

    @Column({ type: 'enum', enum: AssetOrigin, nullable: true })
    origin: AssetOrigin | null;

    @Column({ name: 'supplier_or_donor', type: 'varchar', length: 255, nullable: true })
    supplierOrDonor: string | null;

    @Column({ name: 'invoice_number', type: 'varchar', length: 100, nullable: true })
    invoiceNumber: string | null;

    @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.IN_USE })
    status: AssetStatus;

    @Column({
        name: 'conservation_state',
        type: 'enum',
        enum: AssetConservationState,
        nullable: true,
    })
    conservationState: AssetConservationState | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'disposed_at', type: 'date', nullable: true })
    disposedAt: Date | null;

    @Column({
        name: 'disposal_reason',
        type: 'enum',
        enum: AssetDisposalReason,
        nullable: true,
    })
    disposalReason: AssetDisposalReason | null;

    @Column({ name: 'disposal_notes', type: 'text', nullable: true })
    disposalNotes: string | null;

    @OneToMany(() => AssetAttachment, (attachment) => attachment.asset)
    attachments: AssetAttachment[];
}
