module.exports = {
    async up(db) {
        await db.collection('assetpools').updateMany({ network: 0 }, { $set: { chainId: 80001 } });
        await db.collection('assetpools').updateMany({ network: 1 }, { $set: { chainId: 137 } });
        await db.collection('erc20').updateMany({ network: 0 }, { $set: { chainId: 80001 } });
        await db.collection('erc20').updateMany({ network: 1 }, { $set: { chainId: 137 } });
        await db.collection('erc721').updateMany({ network: 0 }, { $set: { chainId: 80001 } });
        await db.collection('erc721').updateMany({ network: 1 }, { $set: { chainId: 137 } });
        await db.collection('membership').updateMany({ network: 0 }, { $set: { chainId: 80001 } });
        await db.collection('membership').updateMany({ network: 1 }, { $set: { chainId: 137 } });
        await db.collection('transactions').updateMany({ network: 0 }, { $set: { chainId: 80001 } });
        await db.collection('transactions').updateMany({ network: 1 }, { $set: { chainId: 137 } });
    },

    async down(db) {
        //
    },
};
