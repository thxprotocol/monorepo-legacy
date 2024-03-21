import { Request, Response } from 'express';
import { parseToken } from '@thxnetwork/api/util/jwt';
import PoolService from '@thxnetwork/api/services/PoolService';
import RewardService from '@thxnetwork/api/services/RewardService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const controller = async (req: Request, res: Response) => {
    const token = parseToken(req.header('authorization'));
    const sub = token && token.sub;

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const account = sub && (await AccountProxy.findById(sub));

    const [coin, nft, custom, coupon, discordRole, galachain] = await RewardService.list({
        pool,
        account,
    });

    res.json({ coin, nft, custom, coupon, discordRole, galachain });
};

export default { controller };
