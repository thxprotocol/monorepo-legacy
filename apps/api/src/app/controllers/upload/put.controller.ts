import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';

export default {
    controller: async (req: Request, res: Response) => {
        const file = req.file;
        if (!file) return res.status(440).send('There no file to process');
        const response = await ImageService.upload(file);
        const publicUrl = ImageService.getPublicUrl(response.key);
        res.send({ publicUrl });
    },
};
