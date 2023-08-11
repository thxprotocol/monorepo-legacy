module.exports = {
    async up(db) {
        const walletsColl = db.collection('wallets');
        await walletsColl.dropIndex({ sub: 'hashed' });
        await walletsColl.createIndex({ sub: 'hashed' }, { unique: false, sparse: true });

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
            await collection.dropIndex({ walletId: 'hashed' });
            await collection.createIndex({ walletId: 'hashed' }, { unique: false, sparse: true });
        }
    },

    async down() {
        //
    },
};
