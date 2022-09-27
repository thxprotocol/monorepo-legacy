import YoutubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import { Request, Response } from 'express';

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const { isAuthorized, channels, videos } = await YoutubeDataProxy.getYoutube(req.auth.sub);

    if (!isAuthorized) return res.json({ isAuthorized });

    res.send({
        isAuthorized,
        channels,
        videos,
    });
};

export default { controller };
