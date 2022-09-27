const { ObjectId } = require('mongodb');

module.exports = {
    async up(db) {
        const membershipsColl = db.collection('membership');
        const erc20tokenColl = db.collection('erc20token');
        const promises = (await membershipsColl.find().toArray()).map(async (membership) => {
            const erc20TokenId = membership.erc20Id;
            if (erc20TokenId) {
                const erc20Token = await erc20tokenColl.findOne({ _id: new ObjectId(erc20TokenId) });
                if (erc20Token) {
                    await membershipsColl.updateOne({ _id: membership._id }, { $set: { erc20Id: erc20Token.erc20Id } });
                }
            }
        });

        await Promise.all(promises);
    },
    async down() {
        //
    },
};
