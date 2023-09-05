const { toChecksumAddress } = require('web3-utils');

module.exports = {
    async up(db) {
        const walletsColl = await db.collection('wallets');

        for (const wallet of await walletsColl.find({}).toArray()) {
            try {
                if (!wallet.address) continue;
                const address = toChecksumAddress(wallet.address);
                await walletsColl.updateOne({ _id: wallet._id }, { $set: { address } });
            } catch (error) {
                console.error(error);
            }
        }

        const erc20Coll = await db.collection('erc20');

        for (const erc20 of await erc20Coll.find({}).toArray()) {
            try {
                if (!erc20.address) continue;
                const address = toChecksumAddress(erc20.address);
                await erc20Coll.updateOne({ _id: erc20._id }, { $set: { address } });
            } catch (error) {
                console.error(error);
            }
        }

        const erc721Coll = await db.collection('erc721');

        for (const erc721 of await erc721Coll.find({}).toArray()) {
            try {
                if (!erc721.address) continue;
                const address = toChecksumAddress(erc721.address);
                await erc721Coll.updateOne({ _id: erc721._id }, { $set: { address } });
            } catch (error) {
                console.error(error);
            }
        }
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
