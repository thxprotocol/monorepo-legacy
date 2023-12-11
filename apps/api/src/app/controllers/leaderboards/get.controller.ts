import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Leaderboard']
    const pool = await PoolService.getById(req.params.id);
    const leaderboard = await PoolService.findParticipants(pool, 1, 10);

    res.json(
        leaderboard.results.map((p) => {
            return {
                questsCompleted: p.questEntryCount,
                score: p.score,
                account: {
                    username: p.account.username,
                    profileImg: p.account.profileImg,
                },
            };
        }),
    );
};

export default { controller, validation };
