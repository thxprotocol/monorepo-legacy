module.exports = {
    async up(db) {
        const poolColl = db.collection('assetpools');
        for (const pool of await (await poolColl.find()).toArray()) {
            await poolColl.updateOne({ _id: pool._id }, { $set: { 'settings.slug': String(pool._id) } });
        }
    },
    async down() {
        //
    },
};
