import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointReward as PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';
import db from '@thxnetwork/api/util/database';
import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import axios from 'axios';
import { Widget } from './WidgetService';

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
        await axios.post(pool.settings.discordWebhookUrl, {
            embeds: [
                {
                    title: `:sparkles: Earn ${reward.amount} points!`,
                    description: `**${reward.title}**: ${reward.description}`,
                    url: widget.domain,
                    // color: widget.bgColor,
                },
            ],
        });
    }

    return reward;
}

export const PointReward = PointRewardDocument;

export default { findByPool, create };
