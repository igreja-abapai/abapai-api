import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PrayerRequest } from './entities/prayer-request.entity';

@Injectable()
export class PrayerRequestRepository extends Repository<PrayerRequest> {
    constructor(private dataSource: DataSource) {
        super(PrayerRequest, dataSource.createEntityManager());
    }
}
