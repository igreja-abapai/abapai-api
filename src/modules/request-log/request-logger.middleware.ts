import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestLogService } from './request-log.service';

type ExpressRequest = Request & { user?: { id?: number } };

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger(RequestLoggerMiddleware.name);

    constructor(private readonly requestLogService: RequestLogService) {}

    use(req: ExpressRequest, res: Response, next: NextFunction): void {
        const startedAt = Date.now();
        let logged = false;

        const logRequest = () => {
            if (logged) return;
            logged = true;

            const duration = Date.now() - startedAt;

            // Log asynchronously without blocking the response
            this.requestLogService
                .create({
                    method: req.method,
                    path: req.originalUrl || req.url,
                    statusCode: res.statusCode || null,
                    responseTimeMs: duration,
                    ipAddress: this.extractClientIp(req),
                    userAgent: req.headers['user-agent'] as string,
                    referer: (req.headers.referer || req.headers.referrer) as string,
                    origin: req.headers.origin as string,
                    host: req.headers.host,
                    userId: req.user?.id ? Number(req.user.id) : null,
                    clientName: (req.headers['x-client-name'] as string) || null,
                    queryParams: this.clonePlainObject(req.query),
                    body: this.sanitizeBody(req.body),
                    headers: this.extractHeaders(req.headers),
                })
                .catch((error) => {
                    this.logger.error('Failed to log request', error as Error);
                });
        };

        res.on('finish', logRequest);
        res.on('close', logRequest);

        res.on('error', (error) => {
            this.logger.error('Response stream error while logging request', error as Error);
            logRequest();
        });

        next();
    }

    private extractClientIp(req: ExpressRequest): string | null {
        const forwarded = (req.headers['x-forwarded-for'] as string) || '';
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return (req.ip || req.socket?.remoteAddress || null) as string | null;
    }

    private clonePlainObject(source: unknown): Record<string, unknown> | null {
        if (!source || typeof source !== 'object') {
            return null;
        }
        return JSON.parse(JSON.stringify(source));
    }

    private sanitizeBody(body: unknown): Record<string, unknown> | null {
        if (!body || typeof body !== 'object') {
            return null;
        }

        const cloned = this.clonePlainObject(body) ?? {};
        const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'authorization'];

        const scrub = (obj: Record<string, unknown>) => {
            Object.entries(obj).forEach(([key, value]) => {
                if (sensitiveKeys.includes(key)) {
                    obj[key] = '[REDACTED]';
                    return;
                }
                if (value && typeof value === 'object') {
                    scrub(value as Record<string, unknown>);
                }
            });
        };

        scrub(cloned);
        return cloned;
    }

    private extractHeaders(headers: Request['headers']): Record<string, unknown> | null {
        if (!headers) {
            return null;
        }

        const cloned = { ...headers };
        delete cloned.authorization;
        delete cloned.cookie;
        delete cloned['x-forwarded-proto'];
        delete cloned['x-forwarded-port'];

        return cloned as Record<string, unknown>;
    }
}
