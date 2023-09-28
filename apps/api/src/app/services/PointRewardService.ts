import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointRewardDocument, PointReward as PointRewardSchema } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';
import db from '@thxnetwork/api/util/database';
import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import axios from 'axios';
import { Widget } from './WidgetService';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { PointBalance } from './PointBalanceService';

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
            content: '@here ' + pool.settings.defaults.discordMessage,
            embeds: [
                {
                    title: `${reward.title}`,
                    description: reward.description,
                    url: widget.domain,
                },
            ],
        });
    }

    return reward;
}

async function findEntries(quest: PointRewardDocument) {
    const entries = await PointRewardClaim.find({ pointRewardId: quest._id });
    const subs = entries.map((entry) => entry.sub);
    const accounts = await AccountProxy.getMany(subs);

    return await Promise.all(
        entries.map(async (entry) => {
            const wallet = await Wallet.findById(entry.walletId);
            const account = accounts.find((a) => a.sub === wallet.sub);
            const pointBalance = await PointBalance.findOne({
                poolId: quest.poolId,
                walletId: wallet._id,
            });
            return { ...entry.toJSON(), account, wallet, pointBalance: pointBalance ? pointBalance.balance : 0 };
        }),
    );
}

export const PointReward = PointRewardSchema;

export default { findByPool, findEntries, create };
