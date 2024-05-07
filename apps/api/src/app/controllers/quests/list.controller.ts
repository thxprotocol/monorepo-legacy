import { Request, Response } from 'express';
import { getIP } from '@thxnetwork/api/util/ip';
import PoolService from '@thxnetwork/api/services/PoolService';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { parseToken } from '@thxnetwork/api/util/jwt';

// This endpoint is public so we do not get req.auth populated
// so we need to decode the auth header manually when it is present
const controller = async (req: Request, res: Response) => {
    const token = parseToken(req.header('authorization'));
    const sub = token && token.sub;

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const account = sub && (await AccountProxy.findById(sub));

    const ip = getIP(req);
    // Results are returned in order of the QuestVariant enum keys
    const [daily, invite, twitter, discord, youtube, custom, web3, gitcoin, webhook] = await QuestService.list({
        pool,
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
        webhook,
    });
};

export default { controller };
