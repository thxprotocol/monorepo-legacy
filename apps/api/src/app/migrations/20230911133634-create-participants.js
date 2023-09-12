const { ObjectId } = require('mongodb');

module.exports = {
    async up(db) {
        const collParticipants = db.collection('participants');
        const collWallets = db.collection('wallets');
        const collectionNames = [
            'dailyrewardclaims',
            'referralrewardclaims',
            'pointrewardclaims',
            'milestonerewardclaims',
            'web3questclaims',
        ];
        const results = await Promise.all(
            collectionNames.map(async (name) => {
                try {
                    return (await db.collection(name).find({})).toArray();
                } catch (error) {
                    console.log(name, error);
                }
            }),
        );
        const entries = Array.from(new Set(results.flat(1)));
        for (const entry of entries) {
            try {
                if (!entry.walletId) continue;
                const wallet = await collWallets.findOne({ _id: new ObjectId(entry.walletId) });
                if (!wallet || !wallet.sub) continue;
                const payload = { poolId: entry.poolId, sub: wallet.sub };
                const exists = await collParticipants.findOne(payload);
                if (exists) continue;
                await collParticipants.insert({ ...payload, createdAt: entry.createdAt });
            } catch (error) {
                console.log(entry, error);
            }
        }
    },
};
