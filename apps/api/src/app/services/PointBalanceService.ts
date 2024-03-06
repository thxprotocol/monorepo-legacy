import { Participant, PoolDocument } from '@thxnetwork/api/models';

async function add(pool: PoolDocument, account: TAccount, amount: number) {
    const participant = await Participant.findOne({ poolId: pool._id, sub: account.sub });
    const balance = participant ? Number(participant.balance) + Number(amount) : Number(amount);

    await Participant.updateOne(
        { poolId: String(pool._id), sub: account.sub },
        { poolId: String(pool._id), sub: account.sub, balance },
        { upsert: true },
    );
}

async function subtract(pool: PoolDocument, account: TAccount, price: number) {
    if (!price) return;

    const participant = await Participant.findOne({ poolId: pool._id, sub: account.sub });
    if (!participant) return;

    const balance = Number(participant.balance) >= price ? Number(participant.balance) - price : 0;

    await Participant.updateOne(
        { poolId: String(pool._id), sub: account.sub },
        { poolId: String(pool._id), sub: account.sub, balance },
        { upsert: true },
    );
}

export default { add, subtract };
