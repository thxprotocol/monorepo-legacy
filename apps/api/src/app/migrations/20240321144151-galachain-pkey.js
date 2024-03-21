const { ethers } = require('ethers');

module.exports = {
    async up(db, client) {
        const poolsColl = db.collection('pool');
        const pools = await (await poolsColl.find({})).toArray();
        const operations = pools.map((pool) => {
            const privateKey = ethers.Wallet.createRandom().privateKey;
            return {
                updateOne: {
                    filter: { _id: pool._id },
                    update: {
                        $set: { 'settings.galachainPrivateKey': privateKey },
                    },
                },
            };
        });
        await poolsColl.bulkWrite(operations);
    },

    async down(db, client) {
        //
    },
};
