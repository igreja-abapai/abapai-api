import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Brackets, Repository } from 'typeorm';
import { AwsService } from '../aws/aws.service';
import { Member } from '../member/entities/member.entity';
import { Department } from '../organization/entities/department.entity';
import { CreateAssetAttachmentDto } from './dto/asset-attachment.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { CreateAssetDto, DisposeAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetAttachment } from './entities/asset-attachment.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { AssetLocation } from './entities/asset-location.entity';
import { Asset } from './entities/asset.entity';
import { AssetOrigin } from './enums/asset-origin.enum';
import { AssetStatus } from './enums/asset-status.enum';
import { normalizeSearchText, translateSqlExpression } from '../../shared/utils/search-text.utils';
import { CHURCH_NAME } from '../../shared/constants/church.constants';

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(AssetAttachment)
        private readonly attachmentRepository: Repository<AssetAttachment>,
        @InjectRepository(AssetCategory)
        private readonly categoryRepository: Repository<AssetCategory>,
        @InjectRepository(AssetLocation)
        private readonly locationRepository: Repository<AssetLocation>,
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        private readonly awsService: AwsService,
    ) {}

    async create(dto: CreateAssetDto, userId: number): Promise<Asset> {
        this.validateAcquisitionValue(dto.origin, dto.acquisitionValue);
        await this.ensureCategoryExists(dto.categoryId);
        await this.ensureLocationExists(dto.locationId);
        if (dto.departmentId) {
            await this.ensureDepartmentExists(dto.departmentId);
        }
        if (dto.responsibleMemberId) {
            await this.ensureMemberExists(dto.responsibleMemberId);
        }

        const code = await this.generateNextCode();
        const asset = this.assetRepository.create({
            code,
            description: dto.description,
            categoryId: dto.categoryId,
            locationId: dto.locationId,
            departmentId: dto.departmentId ?? null,
            responsibleMemberId: dto.responsibleMemberId ?? null,
            responsibleName: dto.responsibleName ?? null,
            quantity: dto.quantity ?? 1,
            acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : null,
            acquisitionValue:
                dto.acquisitionValue !== undefined && dto.acquisitionValue !== null
                    ? dto.acquisitionValue.toFixed(2)
                    : null,
            origin: dto.origin ?? null,
            supplierOrDonor: dto.supplierOrDonor ?? null,
            invoiceNumber: dto.invoiceNumber ?? null,
            photoUrl: dto.photoUrl ?? null,
            status: dto.status ?? AssetStatus.IN_USE,
            conservationState: dto.conservationState ?? null,
            notes: dto.notes ?? null,
            createdBy: userId,
            updatedBy: userId,
        });

        const saved = await this.assetRepository.save(asset);
        return await this.findById(saved.id);
    }

    async findAll(
        query: AssetQueryDto,
    ): Promise<{ data: Asset[]; total: number; page: number; limit: number }> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const qb = this.assetRepository
            .createQueryBuilder('asset')
            .leftJoinAndSelect('asset.category', 'category')
            .leftJoinAndSelect('asset.location', 'location')
            .leftJoinAndSelect('asset.department', 'department')
            .leftJoinAndSelect('asset.responsibleMember', 'responsibleMember');

        if (!query.includeDisposed) {
            qb.andWhere('asset.status != :disposed', { disposed: AssetStatus.DISPOSED });
        }

        if (query.search?.trim()) {
            const term = `%${normalizeSearchText(query.search)}%`;
            qb.andWhere(
                new Brackets((sub) => {
                    sub.where(`${translateSqlExpression('asset.code')} LIKE :term`, {
                        term,
                    }).orWhere(`${translateSqlExpression('asset.description')} LIKE :term`, {
                        term,
                    });
                }),
            );
        }

        if (query.categoryId) {
            qb.andWhere('asset.categoryId = :categoryId', { categoryId: query.categoryId });
        }

        if (query.locationId) {
            qb.andWhere('asset.locationId = :locationId', { locationId: query.locationId });
        }

        if (query.departmentId) {
            qb.andWhere('asset.departmentId = :departmentId', {
                departmentId: query.departmentId,
            });
        }

        if (query.status) {
            qb.andWhere('asset.status = :status', { status: query.status });
        }

        if (query.conservationState) {
            qb.andWhere('asset.conservationState = :conservationState', {
                conservationState: query.conservationState,
            });
        }

        if (query.origin) {
            qb.andWhere('asset.origin = :origin', { origin: query.origin });
        }

        qb.orderBy('asset.code', 'DESC').skip(skip).take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }

    async findById(id: number): Promise<Asset> {
        const asset = await this.assetRepository.findOne({
            where: { id },
            relations: ['category', 'location', 'department', 'responsibleMember', 'attachments'],
        });

        if (!asset) {
            throw new NotFoundException('Bem patrimonial não encontrado');
        }

        if (asset.attachments?.length) {
            asset.attachments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        return asset;
    }

    async update(id: number, dto: UpdateAssetDto, userId: number): Promise<Asset> {
        const existing = await this.findById(id);

        if (dto.categoryId) {
            await this.ensureCategoryExists(dto.categoryId);
        }
        if (dto.locationId) {
            await this.ensureLocationExists(dto.locationId);
        }
        if (dto.departmentId) {
            await this.ensureDepartmentExists(dto.departmentId);
        }
        if (dto.responsibleMemberId) {
            await this.ensureMemberExists(dto.responsibleMemberId);
        }

        const nextOrigin = dto.origin !== undefined ? dto.origin : existing.origin;
        const nextValue =
            dto.acquisitionValue !== undefined
                ? dto.acquisitionValue
                : existing.acquisitionValue
                  ? Number(existing.acquisitionValue)
                  : undefined;

        this.validateAcquisitionValue(nextOrigin, nextValue);

        if (
            existing.status === AssetStatus.DISPOSED &&
            dto.status &&
            dto.status !== AssetStatus.DISPOSED
        ) {
            throw new BadRequestException('Use a ação de reativar para restaurar um bem baixado');
        }

        if (dto.photoUrl !== undefined && dto.photoUrl !== existing.photoUrl && existing.photoUrl) {
            await this.awsService.deleteObjectByUrl(existing.photoUrl);
        }

        await this.assetRepository.update(id, {
            description: dto.description,
            categoryId: dto.categoryId,
            locationId: dto.locationId,
            departmentId: dto.departmentId,
            responsibleMemberId: dto.responsibleMemberId,
            responsibleName: dto.responsibleName,
            quantity: dto.quantity,
            acquisitionDate:
                dto.acquisitionDate === null
                    ? null
                    : dto.acquisitionDate
                      ? new Date(dto.acquisitionDate)
                      : undefined,
            acquisitionValue:
                dto.acquisitionValue === null
                    ? null
                    : dto.acquisitionValue !== undefined
                      ? dto.acquisitionValue.toFixed(2)
                      : undefined,
            origin: dto.origin,
            supplierOrDonor: dto.supplierOrDonor,
            invoiceNumber: dto.invoiceNumber,
            photoUrl: dto.photoUrl,
            status: dto.status,
            conservationState: dto.conservationState,
            notes: dto.notes,
            updatedBy: userId,
        });

        return await this.findById(id);
    }

    async addAttachment(
        assetId: number,
        dto: CreateAssetAttachmentDto,
        userId: number,
    ): Promise<AssetAttachment> {
        await this.findById(assetId);

        const attachment = this.attachmentRepository.create({
            assetId,
            fileName: dto.fileName,
            fileUrl: dto.fileUrl,
            mimeType: dto.mimeType ?? null,
            fileSize: dto.fileSize ?? null,
            createdBy: userId,
            updatedBy: userId,
        });

        return await this.attachmentRepository.save(attachment);
    }

    async removeAttachment(assetId: number, attachmentId: number, userId: number): Promise<void> {
        await this.findById(assetId);

        const attachment = await this.attachmentRepository.findOne({
            where: { id: attachmentId, assetId },
        });

        if (!attachment) {
            throw new NotFoundException('Anexo não encontrado');
        }

        await this.awsService.deleteObjectByUrl(attachment.fileUrl);
        await this.attachmentRepository.delete(attachmentId);

        await this.assetRepository.update(assetId, { updatedBy: userId });
    }

    async dispose(id: number, dto: DisposeAssetDto, userId: number): Promise<Asset> {
        const asset = await this.findById(id);
        if (asset.status === AssetStatus.DISPOSED) {
            throw new BadRequestException('Bem patrimonial já está baixado');
        }

        await this.assetRepository.update(id, {
            status: AssetStatus.DISPOSED,
            disposedAt: new Date(dto.disposedAt),
            disposalReason: dto.disposalReason,
            disposalNotes: dto.disposalNotes ?? null,
            updatedBy: userId,
        });

        return await this.findById(id);
    }

    async reactivate(id: number, userId: number): Promise<Asset> {
        const asset = await this.findById(id);
        if (asset.status !== AssetStatus.DISPOSED) {
            throw new BadRequestException('Somente bens baixados podem ser reativados');
        }

        await this.assetRepository.update(id, {
            status: AssetStatus.IN_USE,
            disposedAt: null,
            disposalReason: null,
            disposalNotes: null,
            updatedBy: userId,
        });

        return await this.findById(id);
    }

    async getSummary(): Promise<{
        activeCount: number;
        totalQuantity: number;
        totalAcquisitionValue: number;
        disposedCount: number;
    }> {
        const allActive = await this.assetRepository
            .createQueryBuilder('asset')
            .where('asset.status != :disposed', { disposed: AssetStatus.DISPOSED })
            .getMany();

        let totalQuantity = 0;
        let totalAcquisitionValue = 0;

        allActive.forEach((asset) => {
            totalQuantity += asset.quantity;
            if (asset.acquisitionValue) {
                totalAcquisitionValue += Number(asset.acquisitionValue) * asset.quantity;
            }
        });

        return {
            activeCount: allActive.length,
            totalQuantity,
            totalAcquisitionValue,
            disposedCount: await this.assetRepository.count({
                where: { status: AssetStatus.DISPOSED },
            }),
        };
    }

    async exportExcel(query: AssetQueryDto): Promise<Buffer> {
        const exportQuery = { ...query, page: 1, limit: 10000 };
        const { data } = await this.findAll(exportQuery);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventário');
        const columnCount = 15;

        const generatedAt = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
        });

        worksheet.addRow([CHURCH_NAME]);
        worksheet.addRow(['Inventário de Patrimônio']);
        worksheet.addRow([`Gerado em: ${generatedAt}`]);
        worksheet.addRow([]);

        worksheet.mergeCells(1, 1, 1, columnCount);
        worksheet.mergeCells(2, 1, 2, columnCount);
        worksheet.mergeCells(3, 1, 3, columnCount);

        const churchCell = worksheet.getCell('A1');
        churchCell.font = { bold: true, size: 16 };
        churchCell.alignment = { horizontal: 'center', vertical: 'middle' };

        const titleCell = worksheet.getCell('A2');
        titleCell.font = { bold: true, size: 12 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        const dateCell = worksheet.getCell('A3');
        dateCell.font = { size: 10, color: { argb: 'FF737373' } };
        dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.columns = [
            { key: 'code', width: 16 },
            { key: 'description', width: 32 },
            { key: 'category', width: 18 },
            { key: 'location', width: 18 },
            { key: 'department', width: 18 },
            { key: 'responsible', width: 22 },
            { key: 'quantity', width: 8 },
            { key: 'acquisitionDate', width: 14 },
            { key: 'acquisitionValue', width: 16 },
            { key: 'totalValue', width: 16 },
            { key: 'origin', width: 14 },
            { key: 'supplierOrDonor', width: 22 },
            { key: 'invoiceNumber', width: 22 },
            { key: 'status', width: 14 },
            { key: 'conservationState', width: 12 },
            { key: 'notes', width: 24 },
        ];

        worksheet.addRow([
            'Código',
            'Descrição',
            'Categoria',
            'Local',
            'Departamento',
            'Responsável',
            'Qtd',
            'Data aquisição',
            'Valor unit. (BRL)',
            'Valor total (BRL)',
            'Origem',
            'Fornecedor/Doador',
            'Nota/cupom',
            'Situação',
            'Conservação',
            'Observações',
        ]);

        const headerRow = worksheet.getRow(5);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' },
        };

        let totalQuantity = 0;
        let totalValue = 0;

        data.forEach((asset) => {
            const unitValue = asset.acquisitionValue ? Number(asset.acquisitionValue) : 0;
            const lineTotal = unitValue * asset.quantity;
            totalQuantity += asset.quantity;
            totalValue += lineTotal;

            worksheet.addRow({
                code: asset.code,
                description: asset.description,
                category: asset.category?.name ?? '',
                location: asset.location?.name ?? '',
                department: asset.department?.name ?? '',
                responsible: this.formatResponsible(asset),
                quantity: asset.quantity,
                acquisitionDate: this.formatIsoDate(asset.acquisitionDate),
                acquisitionValue: unitValue || '',
                totalValue: lineTotal || '',
                origin: asset.origin ?? '',
                supplierOrDonor: asset.supplierOrDonor ?? '',
                invoiceNumber: asset.invoiceNumber ?? '',
                status: asset.status,
                conservationState: asset.conservationState ?? '',
                notes: asset.notes ?? '',
            });
        });

        worksheet.addRow([]);
        worksheet.addRow(['Total de itens (linhas)', data.length]);
        worksheet.addRow(['Quantidade total', totalQuantity]);
        worksheet.addRow(['Valor total de aquisição', totalValue]);

        const valueColumns = ['acquisitionValue', 'totalValue'];
        valueColumns.forEach((key) => {
            worksheet.getColumn(key).numFmt = 'R$ #,##0.00';
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    private formatResponsible(asset: Asset): string {
        if (asset.responsibleMember?.name) {
            return asset.responsibleMember.name;
        }
        return asset.responsibleName ?? '';
    }

    private formatIsoDate(value: Date | string | null | undefined): string {
        if (!value) return '';
        if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
        }
        return String(value).slice(0, 10);
    }

    private validateAcquisitionValue(
        origin: AssetOrigin | null | undefined,
        acquisitionValue: number | null | undefined,
    ): void {
        if (origin === AssetOrigin.PURCHASE) {
            if (
                acquisitionValue === undefined ||
                acquisitionValue === null ||
                acquisitionValue <= 0
            ) {
                throw new BadRequestException(
                    'Valor de aquisição é obrigatório para origem Compra',
                );
            }
        }
    }

    private async generateNextCode(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `PAT-${year}-`;

        const lastAsset = await this.assetRepository
            .createQueryBuilder('asset')
            .where('asset.code LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('asset.code', 'DESC')
            .getOne();

        let nextSeq = 1;
        if (lastAsset) {
            const parts = lastAsset.code.split('-');
            const lastSeq = parseInt(parts[2] ?? '0', 10);
            if (!Number.isNaN(lastSeq)) {
                nextSeq = lastSeq + 1;
            }
        }

        return `${prefix}${String(nextSeq).padStart(3, '0')}`;
    }

    private async ensureCategoryExists(id: number): Promise<void> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException('Categoria não encontrada');
        }
    }

    private async ensureLocationExists(id: number): Promise<void> {
        const location = await this.locationRepository.findOne({ where: { id } });
        if (!location) {
            throw new NotFoundException('Local não encontrado');
        }
    }

    private async ensureDepartmentExists(id: number): Promise<void> {
        const department = await this.departmentRepository.findOne({ where: { id } });
        if (!department) {
            throw new NotFoundException('Departamento não encontrado');
        }
    }

    private async ensureMemberExists(id: number): Promise<void> {
        const member = await this.memberRepository.findOne({ where: { id } });
        if (!member) {
            throw new NotFoundException('Membro não encontrado');
        }
    }
}
