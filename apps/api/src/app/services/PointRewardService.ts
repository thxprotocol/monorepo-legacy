import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointRewardDocument, PointReward as PointRewardSchema } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { PointBalance } from './PointBalanceService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(PointReward, page, limit, { poolId: pool._id });
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

export default { findByPool, findEntries };
