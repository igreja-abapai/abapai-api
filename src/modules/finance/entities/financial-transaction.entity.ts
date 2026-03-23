import { Column, Entity } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { FinancialTransactionType } from './financial-transaction-type.enum';

@Entity()
export class FinancialTransaction extends IdTimestampBaseEntity {
    @Column({ type: 'date' })
    date: Date;

    @Column({
        type: 'enum',
        enum: FinancialTransactionType,
    })
    type: FinancialTransactionType;

    @Column({ length: 100 })
    category: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string;
}
