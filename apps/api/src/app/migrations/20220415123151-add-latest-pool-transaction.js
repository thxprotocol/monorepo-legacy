module.exports = {
    async up(db) {
        const assetpoolsColl = db.collection('assetpools');
        const transactionColl = db.collection('transactions');

        for (const pool of await assetpoolsColl.find().toArray()) {
            try {
                const transactions = await transactionColl
                    .find({ to: pool.address })
                    .sort({ createdAt: -1 })
                    .limit(1)
                    .toArray();

                if (!transactions.length) continue;

                await assetpoolsColl.updateOne(
                    { _id: pool._id },
                    { $set: { lastTransactionAt: transactions[0].createdAt } },
                );
            } catch (error) {
                console.log(error);
            }
        }
    },

    async down(db) {
        await db.collection('assetpools').updateMany({}, { $unset: { lastTransactionAt: null } });
    },
};
