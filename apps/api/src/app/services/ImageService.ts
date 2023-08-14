import short from 'short-uuid';
import { AWS_S3_PUBLIC_BUCKET_NAME, AWS_S3_PUBLIC_BUCKET_REGION } from '@thxnetwork/api/config/secrets';
import { s3Client } from '@thxnetwork/api/util/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

async function upload(file: Express.Multer.File) {
    const [originalname, extension] = file.originalname.split('.');
    const filename =
        originalname.toLowerCase().split(' ').join('-').split('.') + '-' + short.generate() + `.${extension}`;
    const uploadParams = {
        Key: filename,
        Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
        ACL: 'public-read',
        Body: file.buffer,
        ContentType: extension === 'svg' ? 'image/svg+xml' : 'image/*',
        ContentDisposition: 'inline',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return `https://${AWS_S3_PUBLIC_BUCKET_NAME}.s3.${AWS_S3_PUBLIC_BUCKET_REGION}.amazonaws.com/${filename}`;
}

export default { upload };
