module.exports = {
  async up(db) {
    const collections = [
      {
        claimCollectionName: 'milestonerewardclaims',
        rewardCollectionName: 'milestonerewards',
        foreignField: 'milestoneRewardId',
      },
    ];
    // for each collection returns the claims aggregated with the parent reward
    // then updates the poolId claim field with the poolId from the reward
    for (let i = 0; i < collections.length; i++) {
      const args = collections[i];
      const claimCollection = await db.collection(args.claimCollectionName);

      const cursor = await claimCollection.aggregate([
        {
          $match: {
            poolId: null,
          },
        },
        {
          $lookup: {
            from: args.rewardCollectionName,
            let: {
              id: {
                $convert: {
                  input: `$${args.foreignField}`,
                  to: 'objectId',
                },
              },
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$$id', '$_id'],
                      },
                    },
                  ],
                },
              },
            ],
            as: 'reward',
          },
        },
        {
          $unwind: '$reward',
        },
        {
          $set: {
            poolId: '$reward.poolId',
          },
        },
        {
          $project: {
            poolId: '$reward.poolId',
          },
        },
      ]);
      cursor.forEach(async function (project) {
        claimCollection.updateOne({ _id: project._id }, { $set: { poolId: project.poolId } });
      });
    }
  },

  async down() {
    //
  },
};