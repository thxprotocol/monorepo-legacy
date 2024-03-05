import { RewardNFT } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import QRCodeService from '@thxnetwork/api/services/ClaimService';

const validation = [
    body('rewardId').isMongoId(),
    body('claimAmount').isInt(),
    body('redirectURL').isURL({ require_tld: false }),
];

const controller = async (req: Request, res: Response) => {
    const rewardId = req.body.rewardId;
    const redirectURL = req.body.redirectURL;
    const claimAmount = Number(req.body.claimAmount);

    const reward = await RewardNFT.findById(rewardId);
    if (!reward) throw new NotFoundError('Reward not found');

    const entries = await QRCodeService.create({ rewardId, redirectURL }, claimAmount);

    res.status(201).json(entries);
};

export default { controller, validation };
