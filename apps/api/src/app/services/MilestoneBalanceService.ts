import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { MilestoneBalance as MilestoneBalanceDocument } from '@thxnetwork/api/models/MilestoneBalance';

async function add(pool: AssetPoolDocument, sub: string, amount: string) {
    const currentBalance = await MilestoneBalance.findOne({ poolid: pool._id, sub });
    const balance = currentBalance ? Number(currentBalance.balance) + Number(amount) : Number(amount);

    await MilestoneBalance.updateOne({ poolId: pool._id, sub }, { poolId: pool._id, sub, balance }, { upsert: true });
}

async function subtract(pool: AssetPoolDocument, sub: string, price: number) {
    if (!price) return;

    const currentBalance = await MilestoneBalance.findOne({ poolid: pool._id, sub });
    if (!currentBalance) return;

    const balance = Number(currentBalance.balance) >= price ? Number(currentBalance.balance) - price : 0;

    await MilestoneBalance.updateOne({ poolId: pool._id, sub }, { poolId: pool._id, sub, balance }, { upsert: true });
}

export const MilestoneBalance = MilestoneBalanceDocument;

export default { add, subtract };
