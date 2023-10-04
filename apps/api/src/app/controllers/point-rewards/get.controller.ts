import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import { Claim } from '@thxnetwork/api/models/Claim';

const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Quest Social']
    const pointReward = await PointReward.findById(req.params.id);
    const isClaimed = !!(await Claim.exists({ sub: req.auth.sub, rewardUuid: pointReward.uuid }));

    res.json({ ...pointReward.toJSON(), isClaimed });
};

export default { controller, validation };
