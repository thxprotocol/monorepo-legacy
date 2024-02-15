import { Wallet } from '@thxnetwork/api/models/Wallet';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import { Participant } from '@thxnetwork/api/models/Participant';

export default async function main() {
    const chunks = Array.from({ length: 36 }, (_, i) => i * 1000);
    const walletList = await Wallet.find({ sub: { $exists: true } });
    const checks = {};
    for (const skip of chunks) {
        const operations = [];
        const pointBalances = await PointBalance.find().skip(skip).limit(1000);

        for (const pointBalance of pointBalances) {
            const wallets = walletList.filter((w) => String(w._id) === pointBalance.walletId && w.sub);
            if (!wallets.length || wallets.length > 1) continue;

            operations.push({
                updateOne: {
                    filter: { sub: wallets[0].sub, poolId: pointBalance.poolId },
                    update: { $set: { balance: Number(pointBalance.balance) } },
                },
            });
        }

        await Participant.bulkWrite(operations);
        console.log(new Date(), 'chunk', skip, operations.length, Object.values(checks).length);
    }
}
