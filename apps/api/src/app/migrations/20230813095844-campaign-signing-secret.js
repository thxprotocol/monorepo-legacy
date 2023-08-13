const crypto = require('crypto');

module.exports = {
    async up(db) {
        const poolsColl = await db.collection('assetpools');
        const pools = await poolsColl.find({}).toArray();

        for (const pool of pools) {
            const signingSecret = crypto.randomBytes(64).toString('base64');
            await poolsColl.updateOne({ _id: pool._id }, { $set: { signingSecret } });
        }
    },

    async down() {
        //
    },
};
