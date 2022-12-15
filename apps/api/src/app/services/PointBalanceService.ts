import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointBalance as PointBalanceDocument } from '@thxnetwork/api/models/PointBalance';

async function add(pool: AssetPoolDocument, sub: string, amount: string) {
    const currentBalance = await PointBalance.findOne({ poolid: pool._id, sub });
    const balance = currentBalance ? Number(currentBalance.balance) + Number(amount) : Number(amount);

    await PointBalance.updateOne({ poolId: pool._id, sub }, { poolId: pool._id, sub, balance }, { upsert: true });
}

async function subtract(pool: AssetPoolDocument, sub: string, price: number) {
    if (!price) return;

    const currentBalance = await PointBalance.findOne({ poolid: pool._id, sub });
    if (!currentBalance) return;

    const balance = Number(currentBalance.balance) >= price ? Number(currentBalance.balance) - price : 0;

    await PointBalance.updateOne({ poolId: pool._id, sub }, { poolId: pool._id, sub, balance }, { upsert: true });
}

export const PointBalance = PointBalanceDocument;

export default { add, subtract };
