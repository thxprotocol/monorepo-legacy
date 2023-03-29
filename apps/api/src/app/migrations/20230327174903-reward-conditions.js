const axios = require('axios');

function twitterClient(config) {
    try {
        axios.defaults.headers['Authorization'] = `Bearer ${process.env.TWITTER_API_TOKEN}`;
        axios.defaults.baseURL = 'https://api.twitter.com/2';
        return axios(config);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    async up(db) {
        const rewardsColl = db.collection('pointrewards');

        loop: for await (const reward of rewardsColl.find({ interaction: { $exists: true, $ne: -1 } })) {
            try {
                let content = '';
                let contentMetadata = {};

                switch (reward.interaction) {
                    case 0: // YouTubeLike
                        content = reward.content;
                        contentMetadata = {
                            videoId: reward.content,
                            videoURL: 'https://www.youtube.com/watch?v=' + reward.content,
                        };
                        break;
                    case 1: // YouTubeSubscribe
                        content = reward.content;
                        contentMetadata = {
                            channelId: reward.content,
                        };
                        break;
                    case 2: {
                        // TwitterLike
                        if (!reward.content) continue loop;
                        const { data } = await twitterClient({
                            method: 'GET',
                            url: `/tweets`,
                            params: { ids: reward.content, expansions: 'author_id' },
                        });
                        content = reward.content;
                        contentMetadata = {
                            url: 'https://twitter.com/twitter/status/' + reward.content,
                            username: data.includes.users[0].username,
                            text: data.data[0].text,
                        };
                        break;
                    }
                    case 3: {
                        // TwitterRetweet
                        if (!reward.content) continue loop;
                        const { data } = await twitterClient({
                            method: 'GET',
                            url: `/tweets`,
                            params: { ids: reward.content, expansions: 'author_id' },
                        });
                        content = reward.content;
                        contentMetadata = {
                            url: 'https://twitter.com/twitter/status/' + reward.content,
                            username: data.includes.users[0].username,
                            text: data.data[0].text,
                        };
                        break;
                    }
                    case 4: {
                        // TwitterFollow
                        if (!reward.content) continue loop;
                        const { data } = await twitterClient({
                            method: 'GET',
                            url: `/users/${reward.content}`,
                            params: { 'user.fields': 'profile_image_url' },
                        });
                        content = reward.content;
                        contentMetadata = {
                            id: data.data.id,
                            name: data.data.name,
                            username: data.data.username,
                            profileImgUrl: data.data.profile_image_url,
                        };
                        break;
                    }
                    case 5: // DiscordGuildJoined
                        content = reward.content;
                        contentMetadata = {
                            serverId: reward.content,
                            inviteURL: 'https://www.example.com',
                        };
                        break;
                    case 6: {
                        // ShopifyOrderAmount
                        const { amount, shopifyStoreUrl } = JSON.parse(reward.content);
                        content = shopifyStoreUrl;
                        contentMetadata = {
                            amount,
                            shopifyStoreUrl,
                        };
                        break;
                    }
                    case 7: {
                        // ShopifyTotalSpent
                        const { amount, shopifyStoreUrl } = JSON.parse(reward.content);
                        content = shopifyStoreUrl;
                        contentMetadata = {
                            amount,
                            shopifyStoreUrl,
                        };
                        break;
                    }
                    case 8: // ShopifyNewsletterSubscription
                        content = '';
                        contentMetadata = {
                            shopifyStoreUrl: '',
                        };
                        break;
                }

                await rewardsColl.updateOne(
                    { _id: reward._id },
                    { $set: { content, contentMetadata: JSON.stringify(contentMetadata) } },
                );
            } catch (error) {
                console.log(error);
            }
        }
    },

    async down() {
        //
    },
};
