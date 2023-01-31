
const collections = [
  {
    rewardCollectionName: 'erc20perks',
    claimCollectionName: 'erc20perkpayments',
  },
  {

    rewardCollectionName: 'erc721perks',
    claimCollectionName: 'erc721perkpayments',
  },
  {

    rewardCollectionName: 'referralrewards',
    claimCollectionName: 'referralrewardclaims',
  },
  {
    rewardCollectionName: 'pointrewards',
    claimCollectionName: 'pointrewardclaims',
  },
  {
    rewardCollectionName: 'milestonerewards',
    claimCollectionName: 'milestonerewardclaims',
  },
];
module.exports = {
  async up(db) {
    for (let i = 0; i < collections.length; i++) {
      const args = collections[i];
      const rewardCollection = await db.collection(args.rewardCollectionName);
      const claimCollection = await db.collection(args.claimCollectionName);
      await rewardCollection.createIndex({ poolId: "hashed" });
      await rewardCollection.createIndex({ createdAt: 1 });
      await claimCollection.createIndex({ sub: "hashed" })
      await claimCollection.createIndex({ createdAt: 1 })
    }
  },

  async down(db) {
    for (let i = 0; i < collections.length; i++) {
      const args = collections[i];
      const rewardCollection = await db.collection(args.rewardCollectionName);
      const claimCollection = await db.collection(args.claimCollectionName);
      await rewardCollection.dropIndex({ poolId: "hashed" });
      await rewardCollection.dropIndex({ createdAt: 1 });
      await claimCollection.dropIndex({ sub: "hashed" })
      await claimCollection.dropIndex({ createdAt: 1 })
    }
  }
};
