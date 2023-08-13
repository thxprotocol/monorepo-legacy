module.exports = {
    async up(db) {
        const findIndex = async (name) => {
            const indexes = await walletsColl.indexInformation();
            console.log(indexes, indexes.length);
            return indexes.length && indexes.find({ name });
        };

        const walletsColl = db.collection('wallets');
        console.log('wallets');
        if (await findIndex('sub_hashed')) await walletsColl.dropIndex({ sub: 'hashed' });
        await walletsColl.createIndex({ sub: 1 }, { unique: false, sparse: true });

        const collectionNames = [
            // 'claims',
            // 'dailyrewardclaims',
            // 'erc20perkpayments',
            'erc20token',
            // 'erc20transfers',
            // 'erc721perkpayments',
            'erc721token',
            // 'erc721transfers',
            'erc1155token',
            // 'milestonerewardclaims',
            'pointbalances',
            // 'pointrewardclaims',
            // 'poolsubscriptions',
            'referralrewardclaims',
            'transactions',
            'withdrawals',
        ];

        for (const name of collectionNames) {
            console.log(name);
            const collection = db.collection(name);
            if (await findIndex('walletId_1')) await collection.dropIndex({ walletId: 1 });
            await collection.createIndex({ walletId: 1 }, { unique: false, sparse: true });
            console.log(await collection.indexInformation());
        }
    },

    async down() {
        //
    },
};
