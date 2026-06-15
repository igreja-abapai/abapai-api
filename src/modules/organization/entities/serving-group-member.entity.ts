import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Member } from '../../member/entities/member.entity';
import { ServingGroup } from './serving-group.entity';

@Entity('serving_group_members')
@Unique(['servingGroupId', 'memberId'])
export class ServingGroupMember extends IdTimestampBaseEntity {
    @Column({ name: 'serving_group_id' })
    servingGroupId: number;

    @ManyToOne(() => ServingGroup, (group) => group.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'serving_group_id' })
    servingGroup: ServingGroup;

    @Column({ name: 'member_id' })
    memberId: number;

    @ManyToOne(() => Member, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member: Member;
}
