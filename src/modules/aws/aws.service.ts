// aws.service.ts
import { Injectable } from '@nestjs/common';
import { S3, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

@Injectable()
export class AwsService {
    private readonly s3: S3;
    private readonly bucketName: string;
    private readonly region: string;

    constructor() {
        this.region = process.env.AWS_REGION || 'us-west-2';
        this.bucketName = process.env.AWS_BUCKET_NAME;

        this.s3 = new S3({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    async generateUploadURL(fileExtension: string): Promise<string> {
        const rawBytes = await randomBytes(8);
        const imageName = rawBytes.toString('hex') + fileExtension;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: imageName,
        });

        const url = await getSignedUrl(this.s3, command, {
            expiresIn: 60,
        });

        return url;
    }

    async deleteObject(key: string): Promise<void> {
        if (!key) return;
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3.send(command);
    }

    /**
     * Deletes an object given its full URL by extracting the S3 key.
     */
    async deleteObjectByUrl(fileUrl: string): Promise<void> {
        if (!fileUrl) return;
        try {
            const url = new URL(fileUrl);
            // Key is the pathname without leading '/'
            const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
            if (key) {
                await this.deleteObject(key);
            }
        } catch {
            // If URL parsing fails, fallback to last path segment
            const parts = fileUrl.split('/');
            const key = parts[parts.length - 1];
            if (key) {
                await this.deleteObject(key);
            }
        }
    }
}
