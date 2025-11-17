import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from './entities/request-log.entity';

export interface CreateRequestLogInput {
    method: string;
    path: string;
    statusCode?: number | null;
    responseTimeMs?: number | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    referer?: string | null;
    origin?: string | null;
    host?: string | null;
    userId?: number | null;
    clientName?: string | null;
    queryParams?: Record<string, unknown> | null;
    body?: Record<string, unknown> | null;
    headers?: Record<string, unknown> | null;
}

@Injectable()
export class RequestLogService {
    private readonly logger = new Logger(RequestLogService.name);

    constructor(
        @InjectRepository(RequestLog)
        private readonly repository: Repository<RequestLog>,
    ) {}

    async create(payload: CreateRequestLogInput): Promise<void> {
        try {
            const log = this.repository.create(payload);
            await this.repository.save(log);
        } catch (error) {
            this.logger.error('Failed to persist request log', error as Error);
        }
    }
}
