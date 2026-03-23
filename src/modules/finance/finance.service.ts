import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { FinancialTransactionType } from './entities/financial-transaction-type.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Injectable()
export class FinanceService {
    constructor(
        @InjectRepository(FinancialTransaction)
        private readonly transactionRepository: Repository<FinancialTransaction>,
    ) {}

    async createTransaction(
        dto: CreateTransactionDto,
        userId: number,
    ): Promise<FinancialTransaction> {
        const transaction = this.transactionRepository.create({
            ...dto,
            date: new Date(dto.date),
            amount: dto.amount.toFixed(2),
            createdBy: userId,
        });
        return await this.transactionRepository.save(transaction);
    }

    async getTransactions(
        query: TransactionQueryDto,
    ): Promise<{ data: FinancialTransaction[]; total: number; page: number; limit: number }> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.fromDate && query.toDate) {
            where.date = Between(new Date(query.fromDate), new Date(query.toDate));
        } else if (query.fromDate) {
            where.date = MoreThanOrEqual(new Date(query.fromDate));
        } else if (query.toDate) {
            where.date = LessThanOrEqual(new Date(query.toDate));
        }

        if (query.type) {
            where.type = query.type;
        }

        if (query.category) {
            where.category = query.category;
        }

        if (query.minAmount !== undefined || query.maxAmount !== undefined) {
            const min = query.minAmount ?? 0;
            const max = query.maxAmount ?? Number.MAX_SAFE_INTEGER;
            where.amount = Between(min.toFixed(2), max.toFixed(2));
        }

        const [data, total] = await this.transactionRepository.findAndCount({
            where,
            order: { date: 'DESC', id: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
        };
    }

    async getMonthlySummary(
        month: number,
        year: number,
    ): Promise<{
        month: number;
        year: number;
        totalIncome: number;
        totalExpense: number;
        netBalance: number;
    }> {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const transactions = await this.transactionRepository.find({
            where: {
                date: Between(start, end),
            },
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((t) => {
            const amount = Number(t.amount);
            if (t.type === FinancialTransactionType.INCOME) {
                totalIncome += amount;
            } else if (t.type === FinancialTransactionType.EXPENSE) {
                totalExpense += amount;
            }
        });

        const netBalance = totalIncome - totalExpense;

        return {
            month,
            year,
            totalIncome,
            totalExpense,
            netBalance,
        };
    }

    async exportMonthlyReport(month: number, year: number): Promise<Buffer> {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const transactions = await this.transactionRepository.find({
            where: {
                date: Between(start, end),
            },
            order: { date: 'ASC', id: 'ASC' },
        });

        const summary = await this.getMonthlySummary(month, year);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transações');

        worksheet.columns = [
            { header: 'Data', key: 'date', width: 12 },
            { header: 'Tipo', key: 'type', width: 10 },
            { header: 'Categoria', key: 'category', width: 20 },
            { header: 'Descrição', key: 'description', width: 30 },
            { header: 'Valor (BRL)', key: 'amount', width: 15 },
        ];

        worksheet.addRow([]);
        worksheet.addRow(['Resumo do mês', '', '', '', '']);
        worksheet.addRow(['Mês', `${String(month).padStart(2, '0')}/${year}`]);
        worksheet.addRow(['Total de Entradas', summary.totalIncome]);
        worksheet.addRow(['Total de Saídas', summary.totalExpense]);
        worksheet.addRow(['Saldo', summary.netBalance]);
        worksheet.addRow([]);

        worksheet.addRow(['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (BRL)']);

        transactions.forEach((t) => {
            worksheet.addRow({
                date: t.date.toISOString().slice(0, 10),
                type: t.type,
                category: t.category,
                description: t.description,
                amount: Number(t.amount),
            });
        });

        const amountColumn = worksheet.getColumn('amount');
        amountColumn.numFmt = 'R$ #,##0.00';

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
