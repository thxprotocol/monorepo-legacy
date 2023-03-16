module.exports = {
    async up(db) {
        const settings = {
            discordWebhookUrl: '',
            isTwitterSyncEnabled: false,
            defaults: {
                conditionalRewards: {
                    title: '',
                    description: '',
                    amount: 50,
                },
            },
        };
        await db.collection('assetpools').updateMany({}, { $set: { settings } });
    },

    async down(db, client) {
        //
    },
};
