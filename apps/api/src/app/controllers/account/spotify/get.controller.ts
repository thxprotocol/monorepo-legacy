import { Request, Response } from 'express';
import SpotifyDataProxy from '@thxnetwork/api/proxies/SpotifyDataProxy';

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    async function getSpotifyData() {
        const { isAuthorized, error, ...rest } = await SpotifyDataProxy.getSpotify(req.auth.sub);
        if (error) throw new Error(error.message);
        return { isAuthorized, ...rest };
    }

    const { isAuthorized, users, ...rest } = await getSpotifyData();

    if (!isAuthorized) return res.json({ isAuthorized });

    res.send({
        users,
        isAuthorized,
        ...rest,
    });
};

export default { controller };
