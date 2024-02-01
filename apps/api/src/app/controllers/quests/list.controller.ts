import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import jwt_decode from 'jwt-decode';
import PoolService from '@thxnetwork/api/services/PoolService';
import QuestService from '@thxnetwork/api/services/QuestService';
import SafeService from '@thxnetwork/api/services/SafeService';

const getToken = (header: string): { sub: string } => {
    if (!header || !header.startsWith('Bearer ')) return;
    return jwt_decode(header.split(' ')[1]);
};

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Quests']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Campaign not found.');

    // This endpoint is public so we do not get req.auth populated
    // so we need to decode the auth header manually when it is present
    const token = getToken(req.header('authorization'));
    const sub = token && token.sub;
    const wallet = sub && (await SafeService.findPrimary(sub));
    const [daily, invite, twitter, discord, youtube, custom, web3, gitcoin] = await QuestService.list(pool, wallet);

    res.json({
        daily,
        custom,
        invite,
        twitter,
        discord,
        youtube,
        web3,
        gitcoin,
    });
};

export default { controller };
