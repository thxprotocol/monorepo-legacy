module.exports = {
    async up(db) {
        const collections = [
            {
                claimCollectionName: 'erc20perkpayments',
                rewardCollectionName: 'erc20perks',
                foreignField: 'perkId',
            },
            {
                claimCollectionName: 'erc721perkpayments',
                rewardCollectionName: 'erc721perks',
                foreignField: 'perkId',
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
                        amount: { $exists: false },
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
                        amount: '$reward.pointPrice',
                    },
                },
                {
                    $project: {
                        amount: '$reward.pointPrice',
                    },
                },
            ]);

            for await (const project of cursor) {
                try {
                    await claimCollection.updateOne(
                        { _id: project._id },
                        { $set: { amount: String(project.pointPrice) } },
                    );
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
