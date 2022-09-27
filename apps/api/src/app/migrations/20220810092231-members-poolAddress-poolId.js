module.exports = {
    async up(db) {
        const poolsColl = db.collection('assetpools');
        const membersColl = db.collection('member');
        const promises = (await membersColl.find().toArray()).map(async (member) => {
            try {
                const pool = await poolsColl.findOne({ address: member.poolAddress });
                if (pool) {
                    return await membersColl.updateOne(
                        { _id: member._id },
                        { $set: { poolId: String(pool._id) }, $unset: { poolAddress: '' } },
                    );
                }
            } catch (error) {
                console.error(error);
            }
        });

        await Promise.all(promises);
    },
    async down() {
        //
    },
};
