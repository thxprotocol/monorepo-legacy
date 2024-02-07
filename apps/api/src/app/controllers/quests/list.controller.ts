import { Request, Response } from 'express';
import jwt_decode from 'jwt-decode';
import PoolService from '@thxnetwork/api/services/PoolService';
import QuestService from '@thxnetwork/api/services/QuestService';
import SafeService from '@thxnetwork/api/services/SafeService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { getIP } from '@thxnetwork/api/util/ip';

const getToken = (header: string): { sub: string } => {
    if (!header || !header.startsWith('Bearer ')) return;
    return jwt_decode(header.split(' ')[1]);
};

// This endpoint is public so we do not get req.auth populated
// so we need to decode the auth header manually when it is present
const controller = async (req: Request, res: Response) => {
    const token = getToken(req.header('authorization'));
    const sub = token && token.sub;

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const wallet = sub && (await SafeService.findPrimary(sub));
    const account = sub && (await AccountProxy.findById(sub));

    const ip = getIP(req);
    const [daily, invite, twitter, discord, youtube, custom, web3, gitcoin] = await QuestService.list({
        pool,
        wallet,
        account,
        data: { ip },
    });

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
