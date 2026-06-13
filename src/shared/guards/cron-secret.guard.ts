import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class CronSecretGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const secret = process.env.CRON_SECRET;

        if (!secret) {
            throw new UnauthorizedException('Cron secret is not configured.');
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing cron authorization.');
        }

        const token = authHeader.slice('Bearer '.length);

        if (token !== secret) {
            throw new UnauthorizedException('Invalid cron authorization.');
        }

        return true;
    }
}
