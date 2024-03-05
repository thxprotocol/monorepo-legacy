module.exports = {
    async up(db) {
        // Get all qrcodeentries
        const entriesColl = db.collection('qrcodeentry');
        const entries = await (await entriesColl.find()).toArray();
        const rewards = await (await db.collection('rewardnft').find()).toArray();

        // Create operations array with updateOne rewardId: String(reward._id)
        const operations = entries
            .map((entry) => {
                // Find reward for uuid
                const r = rewards.find((reward) => reward.uuid === entry.rewardUuid);
                if (!r) return false;

                return {
                    updateOne: {
                        filter: { _id: entry._id },
                        update: {
                            $set: { rewardId: String(r._id), redirectURL: r.redirectUrl, updatedAt: new Date() },
                        },
                    },
                };
            })
            .filter((op) => !!op);

        // Run bulkWrite
        await entriesColl.bulkWrite(operations);
    },

    async down() {
        //
    },
};
