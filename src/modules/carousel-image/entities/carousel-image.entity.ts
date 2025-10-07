import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('carousel_images')
export class CarouselImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    imageUrl: string;

    @Column({ type: 'text', nullable: true })
    linkUrl?: string;

    // For ordering in carousel
    @Column({ type: 'int', default: 0 })
    position: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
