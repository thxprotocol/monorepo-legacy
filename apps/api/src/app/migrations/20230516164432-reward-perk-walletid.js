module.exports = {
    async up(db) {
        const walletColl = db.collection('wallets');
        for (const name of [
            'dailyrewardclaims',
            'milestonerewardclaims',
            'pointrewardclaims',
            'referralrewardclaims',
            'erc20perkpayments',
            'erc721perkpayments',
            'pointbalances',
        ]) {
            const collection = db.collection(name);
            const documents = await (await collection.find({ walletId: { $exists: false } })).toArray();
            await Promise.all(
                documents.map(async (doc) => {
                    try {
                        const [wallet] = await (await walletColl.find({ sub: doc.sub, chainId: 137 })).toArray();
                        if (!wallet) return;
                        await collection.updateOne({ _id: doc._id }, { $set: { walletId: String(wallet._id) } });
                    } catch (error) {
                        console.log(error);
                    }
                }),
            );
        }
    },

    async down() {
        //
    },
};
