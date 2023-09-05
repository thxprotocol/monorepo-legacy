const { toChecksumAddress } = require('web3-utils');

module.exports = {
    async up(db) {
        const walletsColl = await db.collection('wallets');

        for (const wallet of await walletsColl.find({}).toArray()) {
            const address = toChecksumAddress(wallet.address);
            await walletsColl.updateOne({ _id: wallet._id }, { $set: { address } });
        }

        const erc20Coll = await db.collection('erc20');

        for (const erc20 of await erc20Coll.find({}).toArray()) {
            const address = toChecksumAddress(erc20.address);
            await erc20Coll.updateOne({ _id: erc20._id }, { $set: { address } });
        }

        const erc721Coll = await db.collection('erc721');

        for (const erc721 of await erc721Coll.find({}).toArray()) {
            const address = toChecksumAddress(erc721.address);
            await erc721Coll.updateOne({ _id: erc721._id }, { $set: { address } });
        }
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
