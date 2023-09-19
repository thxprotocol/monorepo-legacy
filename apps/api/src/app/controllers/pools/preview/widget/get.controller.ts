import { Request, Response } from 'express';
import { param } from 'express-validator';
import BrandService from '@thxnetwork/api/services/BrandService';
import { s3Public } from '@thxnetwork/api/util/s3';
import { AWS_S3_PUBLIC_BUCKET_NAME } from '@thxnetwork/api/config/secrets';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // Get brand background
    const brand = await BrandService.get(req.params.id);
    const url = new URL(brand.widgetPreviewImgUrl);

    // Retrieve the image from S3 and stream it directly to the response
    const s3Object = await s3Public.getObject({
        Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
        Key: url.pathname.split('/')[1],
    });

    (s3Object.Body as any).pipe(res);
};

export default { controller, validation };
