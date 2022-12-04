import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointBalance as PointBalanceDocument } from '@thxnetwork/api/models/PointBalance';

async function add(pool: AssetPoolDocument, sub: string, amount: string) {
    const currentBalance = await PointBalance.findOne({ poolid: pool._id, sub });
    const balance = currentBalance ? Number(currentBalance.balance) + Number(amount) : Number(amount);

    await PointBalance.updateOne({ poolId: pool._id, sub }, { poolId: pool._id, sub, balance }, { upsert: true });
}

export const PointBalance = PointBalanceDocument;

export default { add };
