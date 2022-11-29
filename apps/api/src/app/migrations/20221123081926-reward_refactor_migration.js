const { v4 } = require('uuid');

const isUndefined = (r) => typeof r.withdrawCondition.channelType === undefined;

module.exports = {
    async up(db) {
        const rewardsColl = db.collection('rewards');
        const erc721RewardsColl = db.collection('erc721rewards');
        const claimsColl = db.collection('claims');
        const rewards = await rewardsColl.find({}).toArray();

        const promises = rewards.map(async (r) => {
            try {
                const payload = {
                    uuid: r.id || v4(),
                    title: r.title || undefined,
                    expiryDate: r.expiryDate,
                    poolId: r.poolId,
                    rewardLimit: r.withdrawLimit,
                    claimAmount: r.amount,
                    createdAt: r.createdAt,
                    updatedAt: r.updatedAt,
                };

                if (r.withdrawCondition) {
                    if (!isUndefined(r.withdrawCondition.platform)) {
                        payload.platform = r.withdrawCondition.channelType;
                    } else {
                        payload.platform = 0;
                    }

                    if (!isUndefined(r.withdrawCondition.channelAction)) {
                        payload.interaction = r.withdrawCondition.channelAction;
                    }

                    if (!isUndefined(r.withdrawCondition.channelAction)) {
                        payload.content = r.withdrawCondition.channelAction;
                    }
                }

                if (!isUndefined(r.erc721metadataId)) {
                    const erc721Reward = await erc721RewardsColl.insertOne({
                        ...payload,
                        erc721metadataId: r.erc721metadataId,
                    });
                    await claimsColl.updateMany(
                        { rewardId: String(r._id) },
                        { $set: { rewardId: String(erc721Reward._id) } },
                    );
                } else {
                    const erc20Reward = await erc721RewardsColl.insertOne({
                        ...payload,
                        amount: r.withdrawAmount,
                    });
                    await claimsColl.updateMany(
                        { rewardId: String(r._id) },
                        { $set: { rewardId: String(erc20Reward._id) } },
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
