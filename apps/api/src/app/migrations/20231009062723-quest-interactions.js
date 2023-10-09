module.exports = {
    async up(db) {
        const questColl = db.collection('pointrewards');
        const contentMetadata = JSON.stringify({ inviteURL: 'https://discord.com/invite/TzbbSmkE7Y' });

        await questColl.updateMany(
            { interaction: { $exists: false } },
            {
                $set: {
                    platform: 5,
                    interaction: 5,
                    content: '836147176270856243',
                    contentMetadata,
                    isPublished: false,
                },
            },
        );
    },

    async down() {
        //
    },
};
