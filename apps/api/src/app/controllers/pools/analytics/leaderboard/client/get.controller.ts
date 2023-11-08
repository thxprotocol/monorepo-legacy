import { Request, Response } from 'express';
import { query, param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { TAccount } from '@thxnetwork/types/interfaces';

export const validation = [param('id').isMongoId(), query('platform').optional().isString()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);

    const leaderBoard = await AnalyticsService.getLeaderboard(pool);
    if (req.query.platform === 'discord') {
        const promises = leaderBoard
            .slice(0, 10)
            .filter((x) => (x.account as TAccount).discordAccess === true)
            .map(async (y) => {
                const discordId = await DiscordDataProxy.getUserId(y.account);
                y.account['discordUserId'] = discordId;
            });
        await Promise.all(promises);
    }

    res.json(leaderBoard);
};

export default { controller, validation };
