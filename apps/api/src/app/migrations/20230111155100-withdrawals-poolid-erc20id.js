const { ObjectId } = require('mongodb');

module.exports = {
    async up(db) {
        const poolsColl = db.collection('assetpools');
        const withdrawalsColl = db.collection('withdrawals');
        const withdrawals = await (await withdrawalsColl.find({})).toArray();

        await Promise.all(
            withdrawals.map(async (w) => {
                const pool = await poolsColl.findOne({ _id: ObjectId(w.poolId) });
                if (!pool || !pool.erc20Id) return;

                await withdrawalsColl.updateOne({ _id: w._id }, { $set: { erc20Id: pool.erc20Id } });
            }),
        );
    },
    async down() {
        //
    },
};
