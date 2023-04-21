import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointReward as PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';
import db from '@thxnetwork/api/util/database';
import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import axios from 'axios';
import { Widget } from './WidgetService';
import PoolService from './PoolService';

export function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(PointReward, page, limit, { poolId: pool._id });
}

export async function create(pool: AssetPoolDocument, payload: Partial<TPointReward>) {
    const reward = await PointReward.create({
        uuid: db.createUUID(),
        poolId: pool._id,
        ...payload,
    });

    if (pool.settings.discordWebhookUrl) {
        const widget = await Widget.findOne({ poolId: pool._id });
        const theme = JSON.parse(widget.theme);
        await axios.post(pool.settings.discordWebhookUrl, {
            embeds: [
                {
                    title: ':trophy: New conditional reward!',
                    description: `Claim these points and spend them on crypto perks.`,
                    url: widget.domain,
                    fields: [
                        {
                            name: `${reward.title}`,
                            value: reward.description,
                            inline: true,
                        },
                        {
                            name: ':sparkles: Points',
                            value: reward.amount,
                            inline: true,
                        },
                    ],
                },
            ],
        });
    }

    PoolService.sendNotification(pool, reward);

    return reward;
}

export const PointReward = PointRewardDocument;

export default { findByPool, create };
