import { Request, Response } from 'express';
import { RewardVariant } from '@thxnetwork/types/index';
import { Reward } from '@thxnetwork/api/models/Reward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { IAccount } from '@thxnetwork/api/models/Account';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Rewards']
    let rewards: any = await Reward.find({ poolId: req.assetPool._id });
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

    rewards = rewards.map(async (r) => ({
        amount: r.withdrawAmount,
        title: r.title,
        description:
            'Help us onboard more users to our great game and get rewarded for it with ICE and our forever gratitude.',
        // Variant property will introduce different collection in later work
        variant: r.erc721metadataId ? RewardVariant.ERC721 : RewardVariant.ERC20,
        // claimed: account ? !(await RewardService.canClaim(req.assetPool, r, account)) : false,
        brand: r.withdrawCondition ? r.withdrawCondition.channelType : undefined,
    }));

    res.json(await Promise.all([...pointRewards, ...rewards]));
};

export default { controller };
