import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(Address)
        private addressRepository: Repository<Address>,
    ) {}

    async create(createAddressDto: CreateAddressDto): Promise<Address> {
        const address = this.addressRepository.create(createAddressDto);
        return await this.addressRepository.save(address);
    }

    async findAll(): Promise<Address[]> {
        return await this.addressRepository.find();
    }

    async findOne(id: number): Promise<Address> {
        return await this.addressRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
        await this.addressRepository.update(id, updateAddressDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.addressRepository.delete(id);
    }
}
