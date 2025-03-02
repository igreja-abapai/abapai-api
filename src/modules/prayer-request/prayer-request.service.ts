import { Injectable } from '@nestjs/common';
import { CreatePrayerRequestDto } from './dto/create-prayer-request.dto';
import { PrayerRequestRepository } from './prayer-request.repository';

@Injectable()
export class PrayerRequestService {
    constructor(private readonly prayerRequestRepository: PrayerRequestRepository) {}

    create(prayerRequest: CreatePrayerRequestDto) {
        return this.prayerRequestRepository.save(prayerRequest);
    }

    findAll() {
        return this.prayerRequestRepository.find();
    }

    // findOne(id: number) {
    //     return this.prayerRequestRepository.findOne(id);
    // }

    remove(id: number) {
        return `This action removes a #${id} prayerRequest`;
    }
}
