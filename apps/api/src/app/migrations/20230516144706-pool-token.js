const { v4 } = require('uuid');

module.exports = {
    async up(db) {
        const poolsColl = db.collection('assetpools');
        for (const pool of await (await poolsColl.find({})).toArray()) {
            await poolsColl.updateOne({ _id: pool._id }, { $set: { token: v4() } });
        }
    },

    async down() {
        //
    },
};
