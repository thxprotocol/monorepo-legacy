module.exports = {
    async up(db) {
        const rewardsColl = db.collection('rewards');

        const rewards = await rewardsColl.find({ amount: { $eq: null } }).toArray();

        if (rewards.length == 0) {
            return;
        }
        const promises = rewards.map(async (reward) => {
            try {
                // UPDATE REWARD AMOUNT WITH DEFAULT VALUE: 1
                await rewardsColl.updateOne(
                    { _id: reward._id },
                    {
                        $set: {
                            amount: 1,
                        },
                    },
                );
            } catch (error) {
                console.log(error);
            }
        });

        await Promise.all(promises);
    },

    async down() {
        //
    },
};
