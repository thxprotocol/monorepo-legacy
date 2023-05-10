import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Claim } from '@thxnetwork/api/models/Claim';
import { TClaim } from '@thxnetwork/api/types/TClaim';
import { TBaseReward } from '@thxnetwork/types/';
import db from '@thxnetwork/api/util/database';

function create(data: { poolId: string; rewardUuid: string; erc20Id?: string; erc721Id?: string; erc1155Id?: string }) {
    const claim = { uuid: db.createUUID(), ...data } as TClaim;
    return Claim.create(claim);
}
function findByUuid(uuid: string) {
    return Claim.findOne({ uuid });
}
function findByPool(pool: AssetPoolDocument) {
    return Claim.find({ poolId: String(pool._id) });
}
function findByReward(reward: TBaseReward) {
    return Claim.find({ rewardUuid: reward.uuid, poolId: reward.poolId });
}

export default { create, findByUuid, findByPool, findByReward };
