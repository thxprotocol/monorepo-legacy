import { Request, Response } from 'express';
import { param } from 'express-validator';
import BrandService from '@thxnetwork/api/services/BrandService';
import { AWS_S3_PUBLIC_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { s3Public } from '@thxnetwork/api/util/s3';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // Get brand background
    const brand = await BrandService.get(req.params.id);
    if (!brand) return res.status(404).end();

    // Retrieve the image from S3 and stream it directly to the response
    const Key = `${req.params.id}_widget_preview.png`;
    const s3Object = await s3Public.getObject({
        Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
        Key,
    });

    (s3Object.Body as any).pipe(res);
};

export default { controller, validation };
