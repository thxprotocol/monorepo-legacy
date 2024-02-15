import { Wallet } from '@thxnetwork/api/models/Wallet';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import { Participant } from '@thxnetwork/api/models/Participant';

export default async function main() {
    const balanceCount = await PointBalance.countDocuments();
    const chunkSize = 1000;
    const length = Math.ceil(balanceCount / chunkSize);
    const chunks = Array.from({ length }, (_, i) => i * chunkSize);
    const walletList = await Wallet.find({ sub: { $exists: true } });
    const checks = {};
    for (const skip of chunks) {
        const operations = [];
        const pointBalances = await PointBalance.find().skip(skip).limit(chunkSize);

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
