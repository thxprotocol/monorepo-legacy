import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('campaignId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.campaignId);
    const leaderboard = await PoolService.findParticipants(pool, 1, 10);
    const result = leaderboard.results.map((p) => {
        return {
            questsCompleted: p.questEntryCount,
            score: p.score,
            account: {
                username: p.account.username,
                profileImg: p.account.profileImg,
            },
        };
    });

    res.json(result);
};

export default { controller, validation };
