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
    churchName: string;

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
    about: string;

    @Column({ type: 'text', nullable: true })
    serviceTimes: string;

    @Column({ type: 'text', nullable: true })
    welcomeMessage: string;

    @Column({ type: 'text', nullable: true })
    aboutWhoWeAre: string;

    @Column({ type: 'text', nullable: true })
    aboutOurMission: string;

    @Column({ type: 'text', nullable: true })
    aboutOurValues: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    maintenanceMode: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
