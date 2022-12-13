import { Job } from 'agenda';
import axios from 'axios';
import stream from 'stream';
import path from 'path';
import { AWS_S3_PRIVATE_BUCKET_NAME, DASHBOARD_URL, WALLET_URL } from '@thxnetwork/api/config/secrets';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import BrandService from '@thxnetwork/api/services/BrandService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ImageService from '@thxnetwork/api/services/ImageService';
import MailService from '@thxnetwork/api/services/MailService';
import { logger } from '@thxnetwork/api/util/logger';
import { s3PrivateClient } from '@thxnetwork/api/util/s3';
import { createArchiver } from '@thxnetwork/api/util/zip';
import { Upload } from '@aws-sdk/lib-storage';
import { assetsPath } from '../util/path';
import { ERC721Perk } from '../models/ERC721Perk';

export const generateMetadataRewardQRCodesJob = async ({ attrs }: Job) => {
    if (!attrs.data) return;

    try {
        const { poolId, sub, fileName, notify } = attrs.data;
        const pool = await PoolService.getById(poolId);

        if (!pool) throw new Error('Pool not found');

        const rewards = await ERC721Perk.find({ poolId });
        if (!rewards.length) throw new Error('Rewards not found');

        const account = await AccountProxy.getById(sub);
        if (!account) throw new Error('Account not found');
        if (!account.email) throw new Error('E-mail address for account not set');

        // Create an instance of jsZip and build an archive
        const { jsZip, archive } = createArchiver();

        for (const reward of rewards) {
            const claims = await ClaimService.findByReward(reward);
            if (!claims.length) throw new Error('Claims not found');

            let logoPath: string, logoBuffer: Buffer;
            const brand = await BrandService.get(poolId);

            if (brand && brand.logoImgUrl) {
                try {
                    const response = await axios.get(brand.logoImgUrl, { responseType: 'arraybuffer' });
                    logoBuffer = Buffer.from(response.data, 'utf-8');
                } catch {
                    // Fail silently and fallback to default logo img
                }
            } else {
                logoPath = path.resolve(assetsPath, 'qr-logo.jpg');
            }

            const logo = logoPath || logoBuffer;
            for (const { id } of claims) {
                const base64Data: string = await ImageService.createQRCode(`${WALLET_URL}/claim/${id}`, logo);
                archive.file(`${id}.png`, base64Data, { base64: true });
            }
        }

        const uploadStream = new stream.PassThrough();
        jsZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(uploadStream);

        const multipartUpload = new Upload({
            client: s3PrivateClient,
            params: {
                Key: fileName,
                Bucket: AWS_S3_PRIVATE_BUCKET_NAME,
                Body: uploadStream,
                CacheControl: 'no-cache',
            },
        });

        await multipartUpload.done();
        if (notify) {
            await MailService.send(
                account.email,
                'Your QR codes are ready!',
                `Visit THX Dashboard to download your your QR codes archive. Visit this URL in your browser:
                <br/>${DASHBOARD_URL}/pool/${poolId}`,
            );
        }
    } catch (error) {
        logger.error(error);
    }
};
