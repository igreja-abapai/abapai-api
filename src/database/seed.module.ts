import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { DatabaseSeederService } from './seeder/database-seeder.service';

@Module({
    imports: [DatabaseModule],
    providers: [DatabaseSeederService],
})
export class SeedModule {}
