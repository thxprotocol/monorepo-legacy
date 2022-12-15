import short from 'short-uuid';
import { AWS_S3_PUBLIC_BUCKET_NAME, AWS_S3_PUBLIC_BUCKET_REGION } from '@thxnetwork/api/config/secrets';
import { s3Client } from '@thxnetwork/api/util/s3';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default {
    upload: async (file: Express.Multer.File) => {
        const [originalname, extension] = file.originalname.split('.');
        const filename =
            originalname.toLowerCase().split(' ').join('-').split('.') + '-' + short.generate() + `.${extension}`;
        const stream = file.buffer;
        const uploadParams = {
            Key: filename,
            Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
            ACL: 'public-read',
            Body: stream,
        };

        return { ...(await s3Client.send(new PutObjectCommand(uploadParams))), key: filename };
    },
    getSignedUrl: async (key: string) => {
        const command = new GetObjectCommand({ Bucket: AWS_S3_PUBLIC_BUCKET_NAME, Key: key });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // expires in seconds
        return url;
    },
    getPublicUrl: (key: string) => {
        return `https://${AWS_S3_PUBLIC_BUCKET_NAME}.s3.${AWS_S3_PUBLIC_BUCKET_REGION}.amazonaws.com/${key}`;
    },
};
