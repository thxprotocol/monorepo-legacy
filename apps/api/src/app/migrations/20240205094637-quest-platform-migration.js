// export enum RewardConditionPlatform {
//     None = 0,
//     Google = 1,
//     Twitter = 2,
//     Spotify = 3,
//     Github = 4,
//     Discord = 5,
//     Twitch = 6,
//     Shopify = 7,
// }

module.exports = {
    async up(db, client) {
        const questColl = db.collection('pointrewards');

        // Bulk change twitter quests for platform
        await questColl.deleteOne({ platform: 0 });
        await questColl.update({ platform: 1 }, { $set: { kind: 'google' } });
        await questColl.update({ platform: 2 }, { $set: { kind: 'twitter' } });
        await questColl.deleteOne({ platform: 3 }); //Remove
        await questColl.deleteOne({ platform: 4 }); //Remove
        await questColl.update({ platform: 5 }, { $set: { kind: 'discord' } });
        await questColl.deleteOne({ platform: 6 }); //Remove
        await questColl.deleteOne({ platform: 7 }); //Remove
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
