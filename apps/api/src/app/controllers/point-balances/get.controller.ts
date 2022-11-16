import { Request, Response } from 'express';
import { RewardVariant, BrandVariant } from '@thxnetwork/types/index';
import { Reward } from '@thxnetwork/api/models/Reward';
import RewardService from '@thxnetwork/api/services/RewardService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { IAccount } from '@thxnetwork/api/models/Account';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Balances']
    const balance = await PointBalance.find({ sub: req.auth.sub, poolId: req.assetPool._id });

    if (req.auth?.sub) {
        return res.json({ balance });
    }

    res.json(0);

    // res.json([
    //     {
    //         amount: 50,
    //         title: 'Refer a friend',
    //         description:
    //             'Help us onboard more users to our great game and get rewarded for it with ICE and our forever gratitude.',
    //         variant: RewardVariant.Referral,
    //         claimed: false,
    //         brand: BrandVariant.None,
    //     },
    //     {
    //         amount: 500,
    //         title: 'Follow us on Twitter',
    //         description: 'Verify your follow by connecting your Twitter account before submitting your claim.',
    //         variant: RewardVariant.ERC20,
    //         claimed: false,
    //         brand: BrandVariant.None,
    //     },
    //     {
    //         amount: 50,
    //         title: 'Like this video on Youtube',
    //         description: 'Verify your follow by connecting your Twitter account before submitting your claim.',
    //         variant: RewardVariant.ERC721,
    //         claimed: true,
    //         brand: BrandVariant.Google,
    //     },
    // ]);
};

export default { controller };
