import { Injectable } from '@nestjs/common';
import { CustomConflictException } from '../../shared/exceptions/http-exception';
import { EmailService } from '../../shared/services/email/email.service';
import { EncryptionService } from '../../shared/services/encryption/encryption.service';
import { TokenService } from '../../shared/services/token/token.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private encryptionService: EncryptionService,
        private emailService: EmailService,
        private tokenService: TokenService,
    ) {}

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            relations: ['role', 'role.permissions'],
        });
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({
            where: {
                email,
            },
            relations: ['role', 'role.permissions'],
        });
    }

    async findOne(id: number): Promise<User> {
        return await this.userRepository.findOne({
            where: { id },
            relations: ['role', 'role.permissions'],
        });
    }

    async create(user: CreateUserDto) {
        user.email = user.email.toLowerCase();

        const userExists = await this.userRepository.findOne({
            where: {
                email: user.email,
            },
        });

        if (userExists) {
            throw new CustomConflictException({
                code: 'email-already-registered',
                message: 'This email is already registered',
            });
        }

        const { password } = user;

        const hashedPassword = this.encryptionService.hashSync(password);
        user.password = hashedPassword;

        await this.userRepository.save(user);

        const createdUser = await this.findByEmail(user.email);
        const token = this.tokenService.createPair({ userId: createdUser.id });

        delete createdUser.password;

        return {
            ...token,
            user: createdUser,
        };
    }

    async update(id: number, user: UpdateUserDto) {
        if (user.password) {
            const hashedPassword = this.encryptionService.hashSync(user.password);
            user.password = hashedPassword;
        }

        await this.userRepository.update(id, user);

        return {
            message: 'Successfully updated!',
            userId: id,
        };
    }

    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

    async findUsersWithRoles(roles: string[]): Promise<User[]> {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name IN (:...roles)', { roles })
            .getMany();
    }
}
