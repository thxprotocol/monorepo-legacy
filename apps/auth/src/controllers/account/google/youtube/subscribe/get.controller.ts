import { Request, Response } from 'express';
import { AccountService } from '../../../../../services/AccountService';
import { YouTubeService } from '../../../../../services/YouTubeService';

export const getYoutubeSubscribe = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const result = await YouTubeService.validateSubscribe(account, req.params.item);

    res.json({
        result,
    });
};
