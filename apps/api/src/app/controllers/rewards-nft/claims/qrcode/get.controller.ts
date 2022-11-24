import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError, SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import RewardNftService from '@thxnetwork/api/services/ERC721RewardService';
import { getQrcode } from '@thxnetwork/api/controllers/rewards-utils';

const validation = [param('id').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    if (req.auth.sub !== req.assetPool.sub) throw new SubjectUnauthorizedError();

    const reward = await RewardNftService.get(req.params.id);
    if (!reward) throw new NotFoundError('Reward not found');

    const fileName = `reward-nft-${reward.id}.zip`;
    return await getQrcode(fileName, res, reward, req.assetPool);
};

export default { controller, validation };
