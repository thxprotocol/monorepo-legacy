import { S3, S3Client } from '@aws-sdk/client-s3';
import {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_PRIVATE_BUCKET_REGION,
    AWS_S3_PUBLIC_BUCKET_REGION,
} from '@thxnetwork/api/config/secrets';

const credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
};

const s3Client = new S3Client({
    region: AWS_S3_PUBLIC_BUCKET_REGION,
    credentials,
});

const s3PrivateClient = new S3Client({
    region: AWS_S3_PRIVATE_BUCKET_REGION,
    credentials,
});

const s3Public = new S3({ region: AWS_S3_PUBLIC_BUCKET_REGION, credentials });

export { s3Public, s3Client, s3PrivateClient };
