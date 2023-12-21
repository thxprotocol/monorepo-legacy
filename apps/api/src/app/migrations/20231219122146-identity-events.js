const { ObjectId } = require('mongodb');

module.exports = {
    async up(db) {
        const customQuestEntriesColl = db.collection('milestonerewardclaims');
        const customQuestColl = db.collection('milestonerewards');
        const identitiesColl = db.collection('identities');
        const eventsColl = db.collection('events');
        const walletsColl = db.collection('wallets');
        const wallets = await (await walletsColl.find({ poolId: { $exists: true } })).toArray();

        for (const virtualWallet of wallets) {
            const { _id, poolId, uuid, address, createdAt, updatedAt } = virtualWallet;
            let virtualWalletId = String(_id);
            const primaryWallet = await walletsColl.findOne({
                address,
                $or: [{ poolId: { $exists: false } }, { poolId: { $ne: '' } }],
            });

            try {
                // Create the Identity
                const identity = await identitiesColl.findOneAndUpdate(
                    { uuid },
                    { $set: { poolId, uuid, sub: primaryWallet && primaryWallet.sub, createdAt, updatedAt } },
                    { upsert: true, returnDocument: 'after' },
                );
                const identityId = String(identity.value._id);

                // Create the Event for this Identity
                for (const entry of await (
                    await customQuestEntriesColl.find({ walletId: virtualWalletId })
                ).toArray()) {
                    try {
                        const { milestoneRewardId, createdAt, updatedAt } = entry;
                        const { uuid } = await customQuestColl.findOne({ _id: new ObjectId(milestoneRewardId) });
                        const eventName = uuid;

                        // Register event in Event collection
                        await eventsColl.insertOne(
                            { name: eventName, poolId, identityId, createdAt, updatedAt },
                            { upsert: true },
                        );

                        // Update Custom Quest with eventName
                        await customQuestColl.findOneAndUpdate({ uuid }, { $set: { eventName } });
                    } catch (error) {
                        console.log(virtualWalletId, primaryWallet && primaryWallet.sub, entry._id, error);
                    }
                }
            } catch (error) {
                console.log(virtualWalletId, error);
            }
        }
    },

    async down() {
        //
    },
};
