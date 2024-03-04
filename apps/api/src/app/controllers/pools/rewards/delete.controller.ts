import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { RewardVariant } from '@thxnetwork/common/enums';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import RewardService from '@thxnetwork/api/services/RewardService';

const validation = [param('id').isMongoId(), body('variant').isInt(), param('rewardId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as RewardVariant;
    const poolId = req.params.id;
    const rewardId = req.params.rewardId;

    const reward = await RewardService.findById(variant, rewardId);
    if (reward.poolId !== poolId) throw new ForbiddenError('Not your reward.');

    await reward.deleteOne();

    res.status(204).end();
};

export default { controller, validation };
