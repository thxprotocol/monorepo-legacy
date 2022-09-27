const { toWei } = require('web3-utils');

module.exports = {
    async up(db) {
        const depositsColl = db.collection('deposits');

        await depositsColl.updateMany({ amount: { $type: 1 } }, [{ $set: { amount: { $toString: '$amount' } } }], {
            multi: true,
        });

        const promises = (await depositsColl.find().toArray()).map(async (deposit) => {
            try {
                if (deposit.amount) {
                    await depositsColl.updateOne(
                        { _id: deposit._id },
                        { $set: { amount: toWei(String(deposit.amount), 'ether') } },
                    );
                }
            } catch (error) {
                console.log(error);
            }
        });
        await Promise.all(promises);
    },

    async down(db) {},
};
