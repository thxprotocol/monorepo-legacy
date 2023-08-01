import csvParser from 'csv-parser';
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';
import db from '@thxnetwork/api/util/database';
import PoolService from '@thxnetwork/api/services/PoolService';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/types/contants';
import { ChainId, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { Widget } from '@thxnetwork/api/models/Widget';
import { v4 } from 'uuid';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';

db.connect(process.env.MONGODB_URI);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello world' }],
});

console.log(chatCompletion.data.choices[0].message);

const SUB = '60a38b36bf804b033c5e3faa'; // Local
const chainId = ChainId.Hardhat;
// const SUB = '6074cbdd1459355fae4b6a14'; // Prod
// const chainId = ChainId.Polygon;

async function readCSV() {
    const csvFilePath = path.resolve(__dirname, '../../../quests.csv'); // Replace with the path to your CSV file
    const data: any = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                console.log('CSV data read successfully:');
                resolve(data);
            })
            .on('error', (err) => {
                reject(new Error('Error while reading CSV: ' + err.message));
            });
    });
}

function getYoutubeID(url) {
    if (url && url.toLowerCase().includes('shorts')) return;

    const result = /^https?:\/\/(www\.)?youtu\.be/.test(url)
        ? url.replace(/^https?:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, '$2')
        : url.replace(/.*\?v=([\w-]{11}).*/, '$1');

    return result;
}

async function createPool(title: string, gameUrl: string) {
    const pool = await PoolService.deploy(SUB, chainId, title);

    await Widget.create({
        uuid: v4(),
        poolId: pool._id,
        align: 'right',
        message: 'Hi there!👋 Click me to earn rewards with quests...',
        domain: new URL(gameUrl).origin,
        theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
    });

    return pool;
}

async function main() {
    const start = Date.now();
    const skipped = [];
    console.log('Start');

    try {
        const data: any = await readCSV();

        for (const sql of data) {
            if (sql['Campaign Preview']) continue;
            if (!sql['Game'] || !sql['Game Domain']) continue;
            if (sql['Region'] !== 'Europe') continue; // Run only for Europe campaigns

            let pool = await AssetPool.findOne({ 'settings.title': sql['Game'] });
            if (pool) {
                await Widget.updateOne({ poolId: pool._id }, { domain: new URL(sql['Game Domain']).origin });
            } else {
                pool = await createPool(sql['Game'], sql['Game Domain']);
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
                const socialQuestYoutubeLike = {
                    poolId,
                    title: `Watch & Like`,
                    description: '',
                    amount: 75,
                    platform: RewardConditionPlatform.Google,
                    interaction: RewardConditionInteraction.YouTubeLike,
                    content: getYoutubeID(sql['Youtube Video URL']),
                };
                await PointReward.create(socialQuestYoutubeLike);
            }

            // Create social quest twitter retweet
            if (sql['Twitter Tweet URL']) {
                // const socialQuestFollow = {
                //     poolId,
                //     title: `Follow ${sql['Game']}`,
                //     description: '',
                //     amount: 75,
                //     platform: RewardConditionPlatform.Twitter,
                //     interaction: RewardConditionInteraction.TwitterRetweet,
                //     content: getTwitterUserID(sql['Twitter Tweet URL'])
                // };
                // await PointReward.create(socialQuestFollow);

                const socialQuestRetweet = {
                    poolId,
                    title: `Boost Tweet!`,
                    description: '',
                    amount: 50,
                    platform: RewardConditionPlatform.Twitter,
                    interaction: RewardConditionInteraction.TwitterRetweet,
                    content: sql['Twitter Tweet URL'].match(/\/(\d+)(?:\?|$)/)[1],
                };
                await PointReward.create(socialQuestRetweet);
            }

            // Create social quest twitter retweet
            if (sql['Discord Server ID']) {
                const socialQuestJoin = {
                    title: `Join ${sql['Game']} Discord`,
                    description: 'Become a part of our cozy fam!',
                    amount: 75,
                    platform: RewardConditionPlatform.Discord,
                    interaction: RewardConditionInteraction.DiscordGuildJoined,
                    content: sql['Discord Server ID'],
                    contentMetadata: sql['Discord Invite URL']
                        ? JSON.stringify({ inviteURL: sql['Discord Invite URL'] })
                        : undefined,
                };
                await PointReward.create(socialQuestJoin);
            }

            // Iterate over available quests and create
            for (let i = 1; i < 4; i++) {
                if (!sql[`Q${i} - Type`] || !sql[`Q${i} - Points`] || !sql[`Q${i} - Title`]) {
                    console.log(`Incomplete Q${i}!`);
                    continue;
                }

                switch (sql[`Q${i} - Type`]) {
                    case 'Daily': {
                        const dailyReward = {
                            poolId,
                            title: sql[`Q${i} - Title`],
                            description: sql[`Q${i} - Description`],
                            amounts: [5, 10, 20, 40, 80, 160, 360],
                        };
                        await DailyReward.create(dailyReward);
                        break;
                    }
                    case 'Custom': {
                        const customReward = {
                            poolId,
                            title: sql[`Q${i} - Title`],
                            description: sql[`Q${i} - Description`],
                            amount: Number(sql[`Q${i} - Points`]),
                            limit: 0,
                        };
                        await MilestoneReward.create(customReward);
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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
