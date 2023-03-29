module.exports = {
  async up(db) {
    const collections = [
      {
        claimCollectionName: 'pointrewardclaims',
        rewardCollectionName: 'pointrewards',
        foreignField: 'pointRewardId',
      },
      {
        claimCollectionName: 'dailyrewardclaims',
        rewardCollectionName: 'dailyrewards',
        foreignField: 'dailyRewardId',
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
            amount: null,
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
            amount: '$reward.amount',
          },
        },
        {
          $project: {
            amount: '$reward.amount',
          },
        },
      ]);

      for await (const project of cursor) {
        try {
          await claimCollection.updateOne({ _id: project._id }, { $set: { amount: String(project.amount) } });
          console.log('UPDATED:', project);
        } catch (err) {
          console.log('ERROR UPDATING:', project, err);
        }
      }
    }
  },

  async down() {
    //
  },
};
