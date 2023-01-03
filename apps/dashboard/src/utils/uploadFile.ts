import short from 'short-uuid';
import { AWS_S3_PUBLIC_BUCKET_NAME, AWS_S3_PUBLIC_BUCKET_REGION } from '@thxnetwork/dashboard/utils/secrets';
import { s3Client } from '../utils/s3';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default {
    uploadTos3: async (file: File, folder: string) => {
        const [originalname, extension] = file.name.split('.');
        const filename = `${folder}/${originalname
            .toLowerCase()
            .split(' ')
            .join('-')
            .split('.')}-${short.generate()}.${extension}`;

        const bucket = AWS_S3_PUBLIC_BUCKET_NAME;

        const uploadParams = {
            Key: filename,
            Bucket: bucket,
            ACL: 'public-read',
            Body: Buffer.from(await file.arrayBuffer()),
        };
        const result = { ...(await s3Client.send(new PutObjectCommand(uploadParams))), key: filename, bucket };
        return result;
    },
    getS3SignedUrl: async (bucket: string, key: string) => {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // expires in seconds
        return url;
    },
    getS3PublicUrl: (bucket: string, key: string) => {
        return `https://${bucket}.s3.${AWS_S3_PUBLIC_BUCKET_REGION}.amazonaws.com/${key}`;
    },
    prepareFormDataForUpload(payload: any) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
            if (key == 'file') {
                if (payload.file) {
                    formData.append('file', payload.file);
                }
            } else {
                formData.set(key, payload[key]);
            }
        });
        return formData;
    },
};
