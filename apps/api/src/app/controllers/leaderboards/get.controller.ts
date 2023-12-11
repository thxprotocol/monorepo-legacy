import { Request, Response } from 'express';
import { param } from 'express-validator';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Leaderboard']
    const pool = await PoolService.getById(req.params.id);
    const leaderboardEntries = await AnalyticsService.getLeaderboard(pool, {
        startDate: new Date(pool.createdAt),
        endDate: new Date(),
    });
    const leaderboard = leaderboardEntries.slice(0, 10).map(({ score, questsCompleted, account }) => ({
        questsCompleted,
        score,
        account: {
            username: account.username,
            profileImg: account.profileImg,
        },
    }));

    res.json(leaderboard);
};

export default { controller, validation };
