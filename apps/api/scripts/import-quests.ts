import db from '@thxnetwork/api/util/database';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { ChainId, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { Widget } from '@thxnetwork/api/models/Widget';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import {
    readCSV,
    getYoutubeID,
    getTwitterUsername,
    createPool,
    getSuggestion,
    getTwitterTWeet,
    getTwitterUser,
} from './helpers/index';

db.connect(process.env.MONGODB_URI);

const csvFilePath = '/Users/peterpolman/Downloads/quests.csv';
const sub = '60a38b36bf804b033c5e3faa'; // Local
// const sub = '6074cbdd1459355fae4b6a14'; // Prod
const chainId = ChainId.Hardhat;
// const chainId = ChainId.Polygon;

async function main() {
    const start = Date.now();
    const skipped = [];
    console.log('Start');

    let tokens = 0;
    try {
        const data: any = await readCSV(csvFilePath);

        for (const sql of data) {
            if (sql['Campaign Preview']) continue;
            if (!sql['Game'] || !sql['Game Domain']) continue;
            if (sql['Region'] !== 'Europe') continue; // Run only for Europe campaigns

            let pool = await AssetPool.findOne({ 'settings.title': sql['Game'] });
            if (pool) {
                await Widget.updateOne({ poolId: pool._id }, { domain: new URL(sql['Game Domain']).origin });
            } else {
                pool = await createPool(sub, chainId, sql['Game'], sql['Game Domain']);
            }

            const poolId = pool ? pool._id : 'testtest';

            // Remove all existing quests
            await Promise.all([
                DailyReward.deleteMany({ poolId }),
                ReferralReward.deleteMany({ poolId }),
                PointReward.deleteMany({ poolId }),
                MilestoneReward.deleteMany({ poolId }),
            ]);

            // Create social quest youtube like
            if (sql['Youtube Video URL']) {
                const videoId = getYoutubeID(sql['Youtube Video URL']);
                const socialQuestYoutubeLike = {
                    poolId,
                    title: `Watch & Like`,
                    description: '',
                    amount: 75,
                    platform: RewardConditionPlatform.Google,
                    interaction: RewardConditionInteraction.YouTubeLike,
                    content: videoId,
                    contentMetadata: JSON.stringify({ videoId }),
                };
                await PointReward.create(socialQuestYoutubeLike);
            }

            // Create social quest twitter retweet
            if (sql['Twitter Tweet URL']) {
                const url = sql['Twitter Tweet URL'];
                const username = getTwitterUsername(url);
                const twitterUser = await getTwitterUser(username);
                const socialQuestFollow = {
                    poolId,
                    title: `Follow ${sql['Game']}`,
                    description: '',
                    amount: 75,
                    platform: RewardConditionPlatform.Twitter,
                    interaction: RewardConditionInteraction.TwitterFollow,
                    content: twitterUser.id,
                    contentMetadata: JSON.stringify({
                        id: twitterUser.id,
                        name: twitterUser.name,
                        username: twitterUser.username,
                        profileImgUrl: twitterUser.profile_image_url,
                    }),
                };
                await PointReward.create(socialQuestFollow);

                const tweetId = url.match(/\/(\d+)(?:\?|$)/)[1];
                const [tweet] = await getTwitterTWeet(tweetId);
                const socialQuestRetweet = {
                    poolId,
                    title: `Boost Tweet!`,
                    description: '',
                    amount: 50,
                    platform: RewardConditionPlatform.Twitter,
                    interaction: RewardConditionInteraction.TwitterRetweet,
                    content: tweetId,
                    contentMetadata: JSON.stringify({
                        url,
                        username: twitterUser.username,
                        text: tweet.text,
                    }),
                };
                await PointReward.create(socialQuestRetweet);
            }

            // Create social quest twitter retweet
            if (sql['Discord Server ID']) {
                const serverId = sql['Discord Server ID'];
                const inviteURL = sql['Discord Invite URL'];
                const socialQuestJoin = {
                    title: `Join ${sql['Game']} Discord`,
                    description: 'Become a part of our cozy fam!',
                    amount: 75,
                    platform: RewardConditionPlatform.Discord,
                    interaction: RewardConditionInteraction.DiscordGuildJoined,
                    content: serverId,
                    contentMetadata: JSON.stringify({ serverId, inviteURL: inviteURL || undefined }),
                };
                await PointReward.create(socialQuestJoin);
            }

            // Iterate over available quests and create
            for (let i = 1; i < 4; i++) {
                const questType = sql[`Q${i} - Type`];
                const points = sql[`Q${i} - Points`];
                const title = sql[`Q${i} - Title`];
                if (!questType || !points || !title) {
                    console.log(`Incomplete Q${i}!`);
                    continue;
                }

                let titleSuggestion, descriptionSuggestion;
                if (['Daily', 'Custom'].includes(questType)) {
                    titleSuggestion = await getSuggestion(sql[`Q${i} - Title`], 40);
                    tokens += titleSuggestion.tokensUsed;
                    descriptionSuggestion = await getSuggestion(sql[`Q${i} - Description`], 100);
                    tokens += descriptionSuggestion.tokensUsed;
                }

                switch (questType) {
                    case 'Daily': {
                        const dailyQuest = {
                            poolId,
                            title: titleSuggestion.content,
                            description: descriptionSuggestion.content,
                            amounts: [5, 10, 20, 40, 80, 160, 360],
                        };
                        await DailyReward.create(dailyQuest);
                        console.log(sql[`Q${i} - Type`], titleSuggestion.content, 'quest created!');
                        break;
                    }
                    case 'Custom': {
                        const customQuest = {
                            poolId,
                            title: titleSuggestion.content,
                            description: descriptionSuggestion.content,
                            amount: Number(sql[`Q${i} - Points`]),
                            limit: 0,
                        };
                        await MilestoneReward.create(customQuest);
                        console.log(sql[`Q${i} - Type`], titleSuggestion.content, 'quest created!');
                        break;
                    }
                    default: {
                        console.log(sql[`Q${i} - Type`], 'quest skipped...');
                    }
                }
            }
            console.log('Created: ', sql['Game'], sql['Game Domain']);
            console.log('===============');
        }
    } catch (err) {
        console.error(err);
    }
    console.log('Skipped', skipped);
    console.log('End', Date.now() - start, 'seconds');
    console.log('Tokens Spent', tokens);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
