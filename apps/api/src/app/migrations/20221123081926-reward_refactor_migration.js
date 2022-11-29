const { v4 } = require('uuid');

module.exports = {
    async up(db) {
        const rewardsColl = db.collection('rewards');
        const erc20RewardsColl = db.collection('erc20rewards');
        const erc721RewardsColl = db.collection('erc721rewards');
        const ERC20Reward = 0;
        const ERC721Reward = 1;

        // for each reward that isn't already copied as rewardBase:
        // 1. create a rewardBase: the rewardBase.id field will have the same value as the reward.id field,
        //    so that, we don't need to update all the rewards linked collections (claims, widgets, withdrawals)
        // 2. create a RewardToken or a RewardNft based on the type of Reward

        const rewards = await (
            await rewardsColl.aggregate([
                {
                    $lookup: {
                        from: 'rewardbases',
                        localField: 'id',
                        foreignField: 'id',
                        as: 'bases',
                    },
                },
                {
                    $match: {
                        'bases.id': {
                            $exists: false,
                        },
                    },
                },
            ])
        ).toArray();

        const promises = (await rewards).map(async (reward) => {
            try {
                const variant = reward.erc721metadataId ? RewardNFT : RewardToken;

                await rewardsBaseColl.insertOne({
                    id: reward.id,
                    title: reward.title,
                    slug: reward.slug,
                    variant,
                    poolId: reward.poolId,
                    limit: reward.withdrawLimit,
                    expiryDate: reward.expiryDate,
                    state: reward.state,
                    amount: reward.amount,
                    isClaimOnce: reward.isClaimOnce,
                });
                let rewardCondition;
                if (reward.withdrawCondition) {
                    rewardCondition = await rewardConditionsColl.insertOne({
                        channelType: reward.withdrawCondition.channelType,
                        channelAction: reward.withdrawCondition.channelAction,
                        channelItem: reward.withdrawCondition.channelItem,
                    });
                }
                if (variant === RewardToken) {
                    console.log('creo reward token', reward, reward.id);
                    await rewardsTokensColl.insertOne({
                        id: v4(),
                        rewardBaseId: reward.id,
                        withdrawAmount: reward.withdrawAmount,
                        rewardConditionId: rewardCondition ? rewardCondition.insertedId : null,
                    });
                } else {
                    console.log('creo reward nft', reward, reward.id);
                    await rewardsNftColl.insertOne({
                        id: v4(),
                        rewardBaseId: reward.id,
                        erc721metadataId: reward.erc721metadataId,
                        rewardConditionId: rewardCondition ? rewardCondition.insertedId : null,
                    });
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
