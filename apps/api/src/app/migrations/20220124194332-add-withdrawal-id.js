module.exports = {
    async up(db) {
        const withdrawalsColl = db.collection('withdrawals');

        for (const withdrawal of await withdrawalsColl.find().toArray()) {
            if (withdrawal.id) {
                await withdrawalsColl.updateOne(
                    { _id: withdrawal._id },
                    { $set: { withdrawalId: withdrawal.id }, $unset: { id: null } },
                );
            }
        }
    },

    async down(db) {
        const withdrawalsColl = db.collection('withdrawals');

        for (const withdrawal of await withdrawalsColl.find().toArray()) {
            if (withdrawal.withdrawalId) {
                await withdrawalsColl.updateOne(
                    { _id: withdrawal._id },
                    {
                        $set: { id: withdrawal.withdrawalId },
                        $unset: { withdrawalId: null },
                    },
                );
            }
        }
    },
};
