import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseSeederService } from './seeder/database-seeder.service';

async function bootstrap() {
    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const seederService = app.get(DatabaseSeederService);

        await seederService.seedDatabase();

        await app.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

bootstrap();
