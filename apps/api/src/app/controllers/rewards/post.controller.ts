import { body } from 'express-validator';
import { Request, Response } from 'express';
import RewardService from '@thxnetwork/api/services/RewardService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const validation = [
    body('title').exists().isString(),
    body('slug').exists().isString(),
    body('expiryDate').optional().isString(),
    body('withdrawAmount').exists().isNumeric(),
    body('withdrawDuration').exists().isNumeric(),
    body('withdrawLimit').optional().isNumeric(),
    body('withdrawUnlockDate').isDate().optional({ nullable: true }),
    body('withdrawCondition.channelType').optional().isNumeric(),
    body('withdrawCondition.channelAction').optional().isNumeric(),
    body('withdrawCondition.channelItem').optional().isString(),
    body('amount').isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    let withdrawUnlockDate = req.body.withdrawUnlockDate;

    if (!withdrawUnlockDate) {
        const now = new Date();
        withdrawUnlockDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    }

    const reward = await RewardService.create(req.assetPool, {
        title: req.body.title,
        slug: req.body.slug,
        withdrawLimit: req.body.withdrawLimit || 0,
        withdrawAmount: req.body.withdrawAmount,
        withdrawDuration: req.body.withdrawDuration,
        isMembershipRequired: req.body.isMembershipRequired,
        isClaimOnce: req.body.isClaimOnce,
        withdrawUnlockDate: new Date(withdrawUnlockDate),
        withdrawCondition: req.body.withdrawCondition,
        expiryDate: req.body.expiryDate,
        erc721metadataId: req.body.erc721metadataId,
        amount: req.body.amount,
    });

    let erc20Id: string, erc721Id: string;
    if (reward.erc721metadataId) {
        const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);
        erc721Id = metadata.erc721;
    } else {
        const erc20 = await ERC20Service.findByPool(req.assetPool);
        erc20Id = erc20._id;
    }

    await Promise.all(
        Array.from({ length: reward.amount }).map(() =>
            ClaimService.create({
                poolId: req.assetPool._id,
                erc20Id,
                erc721Id,
                rewardId: String(reward._id),
            }),
        ),
    );

    const claims = await ClaimService.findByReward(reward);

    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
