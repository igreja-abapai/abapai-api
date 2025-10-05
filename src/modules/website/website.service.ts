import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsiteSettings } from './entities/website-settings.entity';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';

@Injectable()
export class WebsiteService {
    constructor(
        @InjectRepository(WebsiteSettings)
        private websiteSettingsRepository: Repository<WebsiteSettings>,
    ) {}

    async getSettings(): Promise<WebsiteSettings> {
        let settings = await this.websiteSettingsRepository.findOne({
            where: { id: 1 },
        });

        if (!settings) {
            // Create default settings if none exist
            settings = this.websiteSettingsRepository.create({
                id: 1,
                address: 'Rua da Igreja, 123 - Centro',
                phone: '(11) 99999-9999',
                email: 'contato@igrejaabapai.com.br',
                facebook: 'https://facebook.com/igrejamcabapai',
                instagram: 'https://instagram.com/igrejamcabapai',
                youtube: 'https://youtube.com/igrejamcabapai',
                twitter: 'https://twitter.com/igrejamcabapai',
                about: 'Nossa igreja é um lugar de acolhimento e crescimento espiritual...',
                serviceTimes: 'Domingo: 9h e 18h\nQuarta: 19h30',
                aboutWhoWeAre:
                    'A Igreja Apostólica Ministério Cristão Aba Pai, localizada no Rio Grande do Norte (RN), foi fundada em 2004 a partir do chamado de Deus na vida do Pastor Raimundo Feliciano. Somos uma igreja comprometida em compartilhar o amor de Deus e viver conforme os ensinamentos de Jesus Cristo.',
                aboutOurMission:
                    'Nosso propósito é glorificar a Deus em tudo o que fazemos, proclamando o evangelho de Jesus Cristo e vivendo de maneira que reflita Seu amor.',
                aboutOurValues:
                    '1. Amar a Deus acima de todas as coisas e demonstrar esse amor através do cuidado, respeito e compaixão pelo próximo.\n2. Viver pela fé, confiando plenamente nas promessas de Deus e obedecendo à Sua Palavra.',
                weeklyMessageUrl: 'https://www.youtube.com/watch?v=wjleWU8J2GY',
                weeklyMessageTitle: 'A visão de quem quer milagre - Pr. Raimundo Feliciano',
                weeklyMessageDate: '21 JUL 2022',
                maintenanceMode: false,
            });
            settings = await this.websiteSettingsRepository.save(settings);
        }

        return settings;
    }

    async updateSettings(updateDto: UpdateWebsiteSettingsDto): Promise<WebsiteSettings> {
        let settings = await this.websiteSettingsRepository.findOne({
            where: { id: 1 },
        });

        if (!settings) {
            settings = this.websiteSettingsRepository.create({
                id: 1,
                ...updateDto,
            });
        } else {
            Object.assign(settings, updateDto);
        }

        return await this.websiteSettingsRepository.save(settings);
    }
}
