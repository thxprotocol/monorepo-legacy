module.exports = {
    async up(db, client) {
        const operation = {
            $rename: {
                perkId: 'rewardId',
            },
        };
        await db.collection('widget').drop();
        await db.collection('erc20perkpayments').updateMany({}, operation);
        await db.collection('erc721perkpayments').updateMany({}, operation);
        await db.collection('couponrewardpayments').updateMany({}, operation);
        await db.collection('customrewardpayments').updateMany({}, operation);
        await db.collection('discordrolerewardpayments').updateMany({}, operation);

        const updates = [
            ['erc20perks', 'rewardcoin'],
            ['erc1155metadata', 'erc1155metadata'],
            ['deposits', ''],
            ['web3questclaims', 'questweb3entry'],
            ['customrewards', 'rewardcustom'],
            ['twitterusers', 'twitteruser'],
            ['erc1155token', 'erc1155token'],
            ['customrewardpayments', 'rewardcustompayment'],
            ['claims', 'qrcodeentry'],
            ['couponrewards', 'rewardcoupon'],
            ['wehbooks', 'webhook'],
            ['changelog', 'changelog'],
            ['discordrolerewardpayments', 'rewarddiscordrolepayment'],
            ['gitcoinquests', 'questgitcoin'],
            ['pointbalances', ''],
            ['pooltransfers', ''],
            ['twitterfollowers', 'twitterfollower'],
            ['member', ''],
            ['erc721transfers', 'erc721transfer'],
            ['erc20token', 'erc20token'],
            ['erc721', 'erc721'],
            ['participants', 'participant'],
            ['twitterreposts', 'twitterrepost'],
            ['erc721token', 'erc721token'],
            ['payments', ''],
            ['twitterlikes', 'twitterlike'],
            ['wallets', 'wallet'],
            ['poolsubscriptions', ''],
            ['transactions', 'transaction'],
            ['erc721perkpayments', 'rewardnftpayment'],
            ['events', 'event'],
            ['erc20swaprules', ''],
            ['discordrolerewards', 'rewarddiscordrole'],
            ['discordguilds', 'discordguild'],
            ['milestonerewardclaims', 'questcustomentry'],
            ['widgets', 'widget'],
            ['withdrawals', ''],
            ['erc721metadata', 'erc721metadata'],
            ['identities', 'identity'],
            ['discordreactions', 'discordreaction'],
            ['client', 'client'],
            ['gitcoinquestentries', 'questgitcoinentry'],
            ['couponrewardpayments', 'rewardcouponpayment'],
            ['web3quests', 'questweb3'],
            ['dailyrewards', 'questdaily'],
            ['webhookrequests', 'webhookrequest'],
            ['discordmessages', 'discordmessage'],
            ['notifications', 'notification'],
            ['jobs', 'jobs'],
            ['couponcodes', 'couponcode'],
            ['erc20swaps', ''],
            ['pointrewards', 'questsocial'],
            ['pointrewardclaims', 'questsocialentry'],
            ['erc1155', 'erc1155'],
            ['walletmanagers', ''],
            ['erc20transfers', 'erc20transfer'],
            ['promocodes', ''],
            ['dailyrewardclaims', 'questdailyentry'],
            ['referralrewardclaims', 'questinviteentry'],
            ['erc721perks', 'rewardnft'],
            ['merchants', ''],
            ['membership', ''],
            ['milestonerewards', 'questcustom'],
            ['assetpools', 'pool'],
            ['brands', 'brand'],
            ['rewards', ''],
            ['erc20perkpayments', 'rewardcoinpayment'],
            ['erc20', 'erc20'],
            ['collaborators', 'collaborator'],
            ['referralrewards', 'rewardinvite'],
        ];

        for (const [oldName, newName] of updates) {
            console.log(oldName, newName);
            if (!newName) continue;
            const collections = await db.listCollections({ name: newName }).toArray();
            if (collections.length) continue;
            await db.renameCollection(oldName, newName);
        }
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
