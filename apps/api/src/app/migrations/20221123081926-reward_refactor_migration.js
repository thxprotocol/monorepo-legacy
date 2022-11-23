const { v4 } = require('uuid');

module.exports = {
  async up(db) {
    const rewardsColl = db.collection('rewards');
    const claimsColl = db.collection('claims');
    const widgetsColl = db.collection('widget');
    const withdrawalsColl = db.collection('withdrawals');
    const rewardsBaseColl = db.collection('rewardbases');
    const rewardsTokensColl = db.collection('rewardtokens');
    const rewardsNftColl = db.collection('rewardnfts');
    const rewardConditionsColl = db.collection('rewardconditions');
    const RewardToken = 0;
    const RewardNFT = 1;  

    const rewards = await (await rewardsColl.find()).toArray();
    // for each reward:
    // 1. create a rewardBase: the rewardBase.id field will have the same value as the reward.id field, 
    // so that, we don't need to update all the rewards linked collections
    // 2. update the Claim, Wisdget and Withdrawal collections with the rewardBase Id (UUID)
    // 3. create a RewardToken or a RewardNft based on the type of Reward
    const promises = (await rewards).map(async (reward) => {
      try {
          const variant = reward.erc721metadataId ? RewardNFT : RewardToken
          // 1. create a rewardBase
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
            isClaimOnce: reward.isClaimOnce
          })
         
          // // 2a. update the Claims
          // await claimsColl.updateOne(
          //   { rewardId: reward.id },
          //   { $set: { rewardId: rewardBase.id } },
          // );
          // // 2b. update the Widgets
          // await widgetsColl.updateOne(
          //   { rewardId: reward.id },
          //   { $set: { rewardId: rewardBase.id } },
          // );
          // // 2c. update the Withdrawals
          // await withdrawalsColl.updateOne(
          //   { rewardId: reward.id },
          //   { $set: { rewardId: rewardBase.id } },
          // );
          // 3. create the Reward Variant
          // 3a. create the reward condition if reward.withdrawCondition is filled
          let rewardCondition;
          if(reward.withdrawCondition) {
            rewardCondition = await rewardConditionsColl.insertOne({
              channelType: reward.withdrawCondition.channelType,
              channelAction: reward.withdrawCondition.channelAction,
              channelItem: reward.withdrawCondition.channelItem,
            })
          }
          if(variant === RewardToken) {
            console.log('creo reward token', reward, reward.id)
            await rewardsTokensColl.insertOne({
              id: v4(),
              rewardBaseId: reward.id,
              withdrawAmount: reward.withdrawAmount,
              rewardConditionId: rewardCondition ? rewardCondition.insertedId : null,
            })
          } else { 
            console.log('creo reward nft', reward, reward.id)
            await rewardsNftColl.insertOne({
              id: v4(),
              rewardBaseId: reward.id,
              erc721metadataId: reward.erc721metadataId,
              rewardConditionId: rewardCondition ? rewardCondition.insertedId : null,
            })
          }

      } catch (error) {
          console.error(error);
      }
      
  });
  await Promise.all(promises);
  },

  async down() {
    // 
  }
};
