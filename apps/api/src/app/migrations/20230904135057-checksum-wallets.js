const { toChecksumAddress } = require('web3-utils');

module.exports = {
    async up(db) {
        const walletsColl = await db.collection('wallets');

        for (const wallet of await walletsColl.find({}).toArray()) {
            const address = toChecksumAddress(wallet.address);
            await walletsColl.updateOne({ _id: wallet._id }, { $set: { address } });
        }
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
