module.exports = {
    async up(db, client) {
        // Remove old collections
        await Promise.all(
            [
                'deposits',
                'erc20swaprules',
                'erc20swaps',
                'member',
                'membership',
                'merchants',
                'payments',
                'poolsubscriptions',
                'pooltransfers',
                'promocodes',
                'rewards',
                'shopifyperks',
                'shopifyperkpayments',
                'shopifydiscountcodes',
                'walletmanagers',
                'withdrawals',
            ].map((name) => db.collection(name).drop()),
        );

        // Publish all rewards
        await Promise.all(
            ['rewardcoin', 'rewardnft', 'rewardcustom', 'rewardcoupon', 'rewarddiscordrole'].map((name) =>
                db.collection(name).updateMany({}, { $set: { isPublished: true } }),
            ),
        );
    },
    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
