import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError, SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import { getQrcode } from '@thxnetwork/api/util/rewards';
import ERC20RewardService from '@thxnetwork/api/services/ERC20RewardService';

const validation = [param('id').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    if (req.auth.sub !== req.assetPool.sub) throw new SubjectUnauthorizedError();

    const reward = await ERC20RewardService.get(req.params.id);
    if (!reward) throw new NotFoundError('Reward not found');

    const fileName = `reward-token-${reward.id}.zip`;
    return await getQrcode(fileName, res, reward, req.assetPool);
};

export default { controller, validation };
