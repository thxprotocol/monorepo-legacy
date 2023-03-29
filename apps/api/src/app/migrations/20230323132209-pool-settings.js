module.exports = {
    async up(db) {
        const poolsColl = db.collection('assetpools');
        for await (const pool of await poolsColl.find({})) {
            const settings = Object.assign(pool.settings, {
                title: pool.title,
                isArchived: pool.archived,
                isWeeklyDigestEnabled: false,
            });
            await poolsColl.updateOne(
                { _id: pool._id },
                {
                    $set: { settings },
                    $unset: {
                        clientId: true,
                        lastTransactionAt: true,
                        latestAdminNonce: true,
                        bypassPolls: true,
                        transactionHash: true,
                        network: true,
                        title: true,
                        archived: true,
                    },
                },
            );
        }
    },

    async down(db, client) {
        //
    },
};
