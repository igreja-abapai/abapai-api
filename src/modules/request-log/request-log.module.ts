import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from './entities/request-log.entity';
import { RequestLogService } from './request-log.service';
import { RequestLoggerMiddleware } from './request-logger.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([RequestLog])],
    providers: [RequestLogService, RequestLoggerMiddleware],
    exports: [RequestLogService, RequestLoggerMiddleware],
})
export class RequestLogModule {}
