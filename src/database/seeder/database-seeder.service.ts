import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
    constructor(private readonly userService: UserService) {}

    async onModuleInit() {
        this.seedUser();
    }

    async seedUser() {
        const newUser = {
            firstName: 'Raimundo',
            lastName: 'Feliciano',
            email: 'raimundo.feliciano@hotmail.com',
            password: 'Admin1234',
        };

        const existingUser = await this.userService.findByEmail(newUser.email);

        if (!existingUser) {
            this.userService.create(newUser);
        }
    }
}
