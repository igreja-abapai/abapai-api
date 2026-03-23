import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { FinancialTransaction } from './entities/financial-transaction.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FinancialTransaction])],
    controllers: [FinanceController],
    providers: [FinanceService],
    exports: [FinanceService],
})
export class FinanceModule {}
