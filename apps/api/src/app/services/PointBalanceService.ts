import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointBalance as PointBalanceDocument } from '@thxnetwork/api/models/PointBalance';

async function add(pool: AssetPoolDocument, walletId: string, amount: number) {
    const currentBalance = await PointBalance.findOne({ poolId: pool._id, walletId });
    const balance = currentBalance ? Number(currentBalance.balance) + Number(amount) : Number(amount);

    await PointBalance.updateOne(
        { poolId: String(pool._id), walletId },
        { poolId: String(pool._id), walletId, balance },
        { upsert: true },
    );
}

async function subtract(pool: AssetPoolDocument, walletId: string, price: number) {
    if (!price) return;

    const currentBalance = await PointBalance.findOne({ poolId: pool._id, walletId });
    if (!currentBalance) return;

    const balance = Number(currentBalance.balance) >= price ? Number(currentBalance.balance) - price : 0;

    await PointBalance.updateOne(
        { poolId: String(pool._id), walletId },
        { poolId: String(pool._id), walletId, balance },
        { upsert: true },
    );
}

export const PointBalance = PointBalanceDocument;

export default { add, subtract };
