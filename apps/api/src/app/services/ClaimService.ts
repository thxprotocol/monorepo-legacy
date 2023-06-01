import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Claim } from '@thxnetwork/api/models/Claim';
import { TBasePerk, TClaim } from '@thxnetwork/types/interfaces';
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
function findByPerk(perk: TBasePerk) {
    return Claim.find({ rewardUuid: perk.uuid, poolId: perk.poolId });
}

export default { create, findByUuid, findByPool, findByPerk };
