import { Request, Response } from 'express';
import ImageService from '@thxnetwork/api/services/ImageService';

const controller = async (req: Request, res: Response) => {
    if (!req.file) return res.status(440).send('There no file to process');
    const result = await ImageService.upload(req.file);
    const publicUrl = ImageService.getPublicUrl(result.key);
    res.send({ publicUrl });
};

export default { controller };
