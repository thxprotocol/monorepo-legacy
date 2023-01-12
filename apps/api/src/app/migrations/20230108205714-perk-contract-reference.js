const { ObjectId } = require('mongodb');

module.exports = {
    async up(db) {
        const poolsColl = db.collection('assetpools');
        const erc20PerksColl = db.collection('erc20perks');
        const erc721PerksColl = db.collection('erc721perks');
        const erc20Perks = await (await erc20PerksColl.find({})).toArray();
        const erc721Perks = await (await erc721PerksColl.find({})).toArray();

        for (const p of erc20Perks) {
            const pool = await poolsColl.findOne({ _id: ObjectId(p.poolId) });
            if (!pool || !pool.erc20Id) return;

            await erc20PerksColl.updateOne({ _id: p._id }, { $set: { erc20Id: pool.erc20Id } });
        }

        for (const p of erc721Perks) {
            const pool = await poolsColl.findOne({ _id: ObjectId(p.poolId) });
            if (!pool || !pool.erc721Id) return;

            await erc721PerksColl.updateOne({ _id: p._id }, { $set: { erc721Id: pool.erc721Id } });
        }
    },
    async down() {
        //
    },
};
