import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('website_settings')
export class WebsiteSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'text', nullable: true })
    phone: string;

    @Column({ type: 'text', nullable: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    facebook: string;

    @Column({ type: 'text', nullable: true })
    instagram: string;

    @Column({ type: 'text', nullable: true })
    youtube: string;

    @Column({ type: 'text', nullable: true })
    twitter: string;

    @Column({ type: 'text', nullable: true })
    about: string;

    @Column({ type: 'text', nullable: true })
    serviceTimes: string;

    @Column({ type: 'text', nullable: true })
    aboutWhoWeAre: string;

    @Column({ type: 'text', nullable: true })
    aboutOurMission: string;

    @Column({ type: 'text', nullable: true })
    aboutOurValues: string;

    @Column({ type: 'text', nullable: true })
    weeklyMessageUrl: string;

    @Column({ type: 'text', nullable: true })
    weeklyMessageTitle: string;

    @Column({ type: 'text', nullable: true })
    weeklyMessageDate: string;

    @Column({ type: 'jsonb', nullable: true })
    bankInfo: {
        bank: string;
        agency: string;
        account: string;
        cnpj: string;
        name: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    pixInfo: {
        type: string;
        key: string;
        name: string;
    };

    @Column({ default: false })
    maintenanceMode: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
