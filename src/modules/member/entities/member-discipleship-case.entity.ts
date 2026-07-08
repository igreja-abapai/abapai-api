import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { User } from '../../user/entities/user.entity';
import { MemberDiscipleshipCaseStatus } from './member-discipleship-case-status.enum';
import { Member } from './member.entity';

@Entity('member_discipleship_case')
export class MemberDiscipleshipCase extends IdTimestampBaseEntity {
    @Column({ name: 'member_id' })
    memberId: number;

    @ManyToOne(() => Member, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({
        type: 'enum',
        enum: MemberDiscipleshipCaseStatus,
        default: MemberDiscipleshipCaseStatus.PENDING,
    })
    status: MemberDiscipleshipCaseStatus;

    @Column({ type: 'text', nullable: true })
    reason: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'opened_at', type: 'timestamp' })
    openedAt: Date;

    @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
    closedAt: Date | null;

    @Column({ name: 'closed_by', nullable: true })
    closedBy: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'closed_by' })
    closedByUser: User | null;
}
