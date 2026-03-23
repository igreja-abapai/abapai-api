import { Body, Controller, Get, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import type { Response } from 'express';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';

@Controller('finance')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FinanceController {
    constructor(private readonly financeService: FinanceService) {}

    @Post('transactions')
    @Permissions('gerenciar_financas')
    async createTransaction(@Body() dto: CreateTransactionDto, @Request() req: any) {
        const userId = req.user.id;
        return await this.financeService.createTransaction(dto, userId);
    }

    @Get('transactions')
    @Permissions('visualizar_financas')
    async getTransactions(@Query() query: TransactionQueryDto) {
        return await this.financeService.getTransactions(query);
    }

    @Get('summary')
    @Permissions('visualizar_financas')
    async getSummary(@Query() query: SummaryQueryDto) {
        return await this.financeService.getMonthlySummary(query.month, query.year);
    }

    @Get('export')
    @Permissions('visualizar_financas')
    async exportMonthly(@Query() query: SummaryQueryDto, @Res() res: Response) {
        const buffer = await this.financeService.exportMonthlyReport(query.month, query.year);
        const filename = `finance-${query.year}-${String(query.month).padStart(2, '0')}.xlsx`;
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
}
