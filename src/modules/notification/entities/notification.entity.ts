import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({ default: 'info' })
    type: string;

    @Column({ type: 'json', nullable: true })
    data: any;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToMany(() => User, { eager: true })
    @JoinTable({ name: 'notification_recipients' })
    recipients: User[];

    @ManyToMany(() => User, { eager: true })
    @JoinTable({ name: 'notification_read_by' })
    readBy: User[];
}
