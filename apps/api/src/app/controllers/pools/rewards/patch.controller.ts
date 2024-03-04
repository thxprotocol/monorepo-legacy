import { param } from 'express-validator';
import { Request, Response } from 'express';
import { RewardVariant } from '@thxnetwork/common/enums';
import RewardService from '@thxnetwork/api/services/RewardService';
import CreateController from '@thxnetwork/api/controllers/pools/rewards/post.controller';

const validation = [param('rewardId').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as RewardVariant;
    const rewardId = req.params.rewardId as string;

    let reward = await RewardService.findById(variant, rewardId);
    reward = await RewardService.update(reward, req.body, req.file);

    res.json(reward);
};

export default { controller, validation };
