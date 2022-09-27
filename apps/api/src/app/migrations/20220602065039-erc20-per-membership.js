module.exports = {
    async up(db) {
        const membershipsColl = db.collection('membership');
        const erc20tokenColl = db.collection('erc20token');
        const memberships = await membershipsColl.find().toArray();
        const promises = memberships.map(async (membership) => {
            try {
                const now = new Date();
                // Check if one erc20 for this address and sub allready exists, if not, then insert
                if (
                    membership.erc20 &&
                    !(await erc20tokenColl.findOne({ erc20Id: membership.erc20, sub: membership.sub }))
                ) {
                    await erc20tokenColl.insertOne({
                        sub: membership.sub,
                        erc20Id: membership.erc20,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });

        await Promise.all(promises);
    },

    async down(db) {},
};
