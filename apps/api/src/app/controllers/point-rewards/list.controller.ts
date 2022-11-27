import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { IAccount } from '@thxnetwork/api/models/Account';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Rewards']
    let pointRewards: any = await PointReward.find({ poolId: req.assetPool._id });
    let account: IAccount;

    if (req.auth?.sub) {
        account = await AccountProxy.getById(req.auth.sub);
    }

    pointRewards = pointRewards.map((r) => ({
        amount: r.amount,
        title: r.title,
        description: r.description,
        // claimed: account ? !(await RewardService.canClaim(req.assetPool, r, account)) : false,
    }));

    res.json(await Promise.all([...pointRewards]));
};

export default { controller };
