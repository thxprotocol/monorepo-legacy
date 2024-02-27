import { PoolDocument } from '@thxnetwork/api/models';
import { Claim } from '@thxnetwork/api/models/Claim';
import db from '@thxnetwork/api/util/database';
import AccountProxy from '../proxies/AccountProxy';

function create(
    data: { poolId: string; rewardUuid: string; erc20Id?: string; erc721Id?: string; erc1155Id?: string },
    claimAmount: number,
) {
    if (!claimAmount) return;
    return Claim.create(Array.from({ length: Number(claimAmount) }).map(() => ({ uuid: db.createUUID(), ...data })));
}
function findByUuid(uuid: string) {
    return Claim.findOne({ uuid });
}
function findByPool(pool: PoolDocument) {
    return Claim.find({ poolId: String(pool._id) });
}
async function findByPerk(reward: TReward) {
    const claims = await Claim.find({ rewardUuid: reward.uuid, poolId: reward.poolId });
    const subs = claims.filter((c) => c.sub).map(({ sub }) => sub);
    const accounts = await AccountProxy.find({ subs });

    return claims
        .map((claim) => {
            return { ...claim.toJSON(), account: accounts.find((a) => claim.sub === a.sub) };
        })
        .sort((a, b) => {
            if (!a.sub && !b.sub) return 0; // Both are undefined, no change in order
            if (!a.sub) return -1; // a.sub is undefined, move it to the bottom
            if (!b.sub) return 1; // b.sub is undefined, move it to the bottom
            return a.sub.localeCompare(b.sub); // Sort by sub values
        });
}

export default { create, findByUuid, findByPool, findByPerk };
