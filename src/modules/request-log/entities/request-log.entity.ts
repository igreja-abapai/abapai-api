import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('request_logs')
export class RequestLog {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 16 })
    method: string;

    @Column({ type: 'text' })
    path: string;

    @Column({ type: 'int', nullable: true })
    statusCode: number | null;

    @Column({ type: 'int', nullable: true })
    responseTimeMs: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    ipAddress: string | null;

    @Column({ type: 'text', nullable: true })
    userAgent: string | null;

    @Column({ type: 'text', nullable: true })
    referer: string | null;

    @Column({ type: 'text', nullable: true })
    origin: string | null;

    @Column({ type: 'text', nullable: true })
    host: string | null;

    @Column({ type: 'int', nullable: true })
    userId: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    clientName: string | null;

    @Column({ type: 'jsonb', nullable: true })
    queryParams: Record<string, unknown> | null;

    @Column({ type: 'jsonb', nullable: true })
    body: Record<string, unknown> | null;

    @Column({ type: 'jsonb', nullable: true })
    headers: Record<string, unknown> | null;

    @CreateDateColumn({ type: 'timestamptz' })
    @Index()
    createdAt: Date;
}
