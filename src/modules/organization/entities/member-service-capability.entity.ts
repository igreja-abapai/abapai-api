import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { CapabilitySource } from '../enums/capability-source.enum';
import { Member } from '../../member/entities/member.entity';
import { ServiceRole } from './service-role.entity';

@Entity('member_service_capabilities')
@Unique(['memberId', 'serviceRoleId'])
export class MemberServiceCapability extends IdTimestampBaseEntity {
    @Column({ name: 'member_id' })
    memberId: number;

    @ManyToOne(() => Member, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ name: 'service_role_id' })
    serviceRoleId: number;

    @ManyToOne(() => ServiceRole, (serviceRole) => serviceRole.memberCapabilities, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'service_role_id' })
    serviceRole: ServiceRole;

    @Column({ type: 'enum', enum: CapabilitySource, default: CapabilitySource.MANUAL })
    source: CapabilitySource;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'valid_from', type: 'date', nullable: true })
    validFrom: Date;

    @Column({ name: 'valid_to', type: 'date', nullable: true })
    validTo: Date;
}
