module.exports = {
    async up(db) {
        const membershipsColl = db.collection('membership');
        const promotionsColl = db.collection('promocodes');
        const rewardsColl = db.collection('rewards');
        const poolsColl = db.collection('assetpools');
        const widgetsColl = db.collection('widget');
        const withdrawalsColl = db.collection('withdrawals');

        await membershipsColl.updateMany({}, { $rename: { erc20: 'erc20Id', erc721: 'erc721Id' } });

        await Promise.all(
            (
                await membershipsColl.find().toArray()
            ).map(async (membership) => {
                try {
                    const pool = await poolsColl.findOne({
                        address: membership.poolAddress,
                        chainId: membership.chainId,
                    });
                    if (pool) {
                        await membershipsColl.updateOne(
                            { _id: membership._id },
                            { $set: { poolId: String(pool._id) } },
                        );
                    }
                } catch (error) {
                    console.log(error);
                }
            }),
        );

        await Promise.all(
            (
                await promotionsColl.find().toArray()
            ).map(async (promotion) => {
                try {
                    const pool = await poolsColl.findOne({
                        address: promotion.poolAddress,
                    });
                    if (pool) {
                        await promotionsColl.updateOne({ _id: promotion._id }, { $set: { poolId: String(pool._id) } });
                    }
                } catch (error) {
                    console.log(error);
                }
            }),
        );

        await Promise.all(
            (
                await rewardsColl.find().toArray()
            ).map(async (reward) => {
                try {
                    const pool = await poolsColl.findOne({
                        address: reward.poolAddress,
                    });
                    if (pool) {
                        await rewardsColl.updateOne({ _id: reward._id }, { $set: { poolId: String(pool._id) } });
                    }
                } catch (error) {
                    console.log(error);
                }
            }),
        );

        await Promise.all(
            (
                await widgetsColl.find().toArray()
            ).map(async (widget) => {
                try {
                    const pool = await poolsColl.findOne({
                        address: widget.metadata.poolAddress,
                    });
                    if (pool) {
                        await widgetsColl.updateOne(
                            { _id: widget._id },
                            { $set: { 'metadata.poolId': String(pool._id) } },
                        );
                    }
                } catch (error) {
                    console.log(error);
                }
            }),
        );

        await Promise.all(
            (
                await withdrawalsColl.find().toArray()
            ).map(async (withdrawal) => {
                try {
                    const pool = await poolsColl.findOne({
                        address: withdrawal.poolAddress,
                    });
                    if (pool) {
                        await withdrawalsColl.updateOne(
                            { _id: withdrawal._id },
                            { $set: { poolId: String(pool._id) } },
                        );
                    }
                } catch (error) {
                    console.log(error);
                }
            }),
        );
    },

    async down() {
        //
    },
};
