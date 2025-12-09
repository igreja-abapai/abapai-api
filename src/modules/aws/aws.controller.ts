import { Controller, Get, Query, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { AwsService } from './aws.service';

@Controller('aws')
export class AwsController {
    constructor(private readonly awsService: AwsService) {}

    @Get('upload-url')
    async getPresignedUrl(@Query('ext') ext: string): Promise<{ url: string }> {
        const url = await this.awsService.generateUploadURL(ext);
        return { url };
    }

    @Get('image/:key(*)')
    async getImage(@Param('key') key: string, @Res() res: Response): Promise<void> {
        try {
            const imageBuffer = await this.awsService.getObject(key);
            const contentType = this.getContentType(key);

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.send(imageBuffer);
        } catch (error) {
            console.error('Error fetching image from S3:', error);
            res.status(404).send('Image not found');
        }
    }

    private getContentType(key: string): string {
        const extension = key.split('.').pop()?.toLowerCase();
        const contentTypes: Record<string, string> = {
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
        };
        return contentTypes[extension || ''] || 'image/jpeg';
    }
}
