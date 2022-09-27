module.exports = {
    async up(db) {
        const withdrawalsColl = db.collection('withdrawals');

        for (const withdrawal of await withdrawalsColl.find().toArray()) {
            if (withdrawal.state === 0) {
                await withdrawalsColl.updateOne({ _id: withdrawal._id }, { $set: { state: -1 } });
            }
        }
    },

    async down(db) {
        const withdrawalsColl = db.collection('withdrawals');

        for (const withdrawal of await withdrawalsColl.find().toArray()) {
            if (withdrawal.state === -1) {
                await withdrawalsColl.updateOne(
                    { _id: withdrawal._id },
                    {
                        $set: { state: 0 },
                    },
                );
            }
        }
    },
};
