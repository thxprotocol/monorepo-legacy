const { v4 } = require('uuid');

const isUndefined = (value) => typeof value === 'undefined' || value == undefined || value == 'undefined';

module.exports = {
    async up(db) {
        const rewardsColl = db.collection('rewards');
        const erc20RewardsColl = db.collection('erc20rewards');
        const erc721RewardsColl = db.collection('erc721rewards');
        const rewards = await (await rewardsColl.find({})).toArray();
        const promises = rewards.map(async (r) => {
            try {
                if (!r) return;
                if (!r.state) return;
                if (!r.poolId) return;

                const payload = {
                    uuid: r.id || v4(),
                    title: r.title || '',
                    description: r.description || '',
                    expiryDate: r.expiryDate || null,
                    poolId: r.poolId,
                    rewardLimit: r.withdrawLimit || 1,
                    claimAmount: r.amount || 1,
                    platform: 0,
                    createdAt: r.createdAt,
                    updatedAt: r.updatedAt,
                };

                if (!isUndefined(r.withdrawCondition)) {
                    if (!isUndefined(r.withdrawCondition.platform)) {
                        payload.platform = r.withdrawCondition.channelType;
                    }

                    if (!isUndefined(r.withdrawCondition.channelAction)) {
                        payload.interaction = r.withdrawCondition.channelAction;
                    }

                    if (!isUndefined(r.withdrawCondition.channelAction)) {
                        payload.content = r.withdrawCondition.channelAction;
                    }
                }

                if (!isUndefined(r.erc721metadataId)) {
                    await erc721RewardsColl.insertOne({
                        ...payload,
                        erc721metadataId: r.erc721metadataId,
                    });
                } else if (!isUndefined(r.withdrawAmount)) {
                    await erc20RewardsColl.insertOne({
                        ...payload,
                        amount: r.withdrawAmount,
                    });
                } else {
                    console.log('Could not migrate ', String(r._id, r));
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
