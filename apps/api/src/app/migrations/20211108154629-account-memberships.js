const { ObjectId } = require('mongodb');

module.exports = {
    async up(db) {
        const accountsColl = db.collection('accounts');
        const assetpoolsColl = db.collection('assetpools');
        const membershipsColl = db.collection('membership');

        await accountsColl.find().forEach(async (account) => {
            const sub = account._id.toString();

            if (account.memberships) {
                for (const poolAddress of account.memberships) {
                    const pool = await assetpoolsColl.findOne({ address: poolAddress });
                    if (pool) {
                        const data = {
                            network: pool.network,
                            sub,
                            poolAddress,
                        };
                        const membership = await membershipsColl.findOne(data);

                        if (!membership) {
                            await membershipsColl.insertOne(data);
                        }
                    }
                }
            }
        });

        await assetpoolsColl.find().forEach(async (pool) => {
            const data = {
                network: pool.network,
                sub: pool.sub,
                poolAddress: pool.address,
            };
            const membership = await membershipsColl.findOne(data);

            if (!membership) {
                await membershipsColl.insertOne(data);
            }
        });

        await accountsColl.updateMany({}, { $unset: { memberships: '' } });
    },

    async down(db) {
        const accountsColl = db.collection('accounts');
        const membershipsColl = db.collection('membership');
        const memberships = await membershipsColl.find().toArray();

        for (const membership of memberships) {
            const account = await accountsColl.findOne({ _id: new ObjectId(membership.sub) });

            if (account.memberships && !account.memberships.includes(membership.poolAddress)) {
                account.memberships.push(membership.poolAddress);
            } else {
                account.memberships = [membership.poolAddress];
            }

            await accountsColl.updateOne(
                { _id: new ObjectId(membership.sub) },
                { $set: { memberships: account.memberships } },
            );
        }

        await membershipsColl.deleteMany({});
    },
};
