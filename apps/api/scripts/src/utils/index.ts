import fs from 'fs';
import OpenAI from 'openai';
import csvParser from 'csv-parser';
import PoolService from '@thxnetwork/api/services/PoolService';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/common/constants';
import { Widget } from '@thxnetwork/api/models/Widget';
import { v4 } from 'uuid';
import { twitterClient } from '@thxnetwork/api/util/twitter';

async function readCSV(csvFilePath: string) {
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

function getTwitterUsername(url: string) {
    return url.split('/')[3];
}

async function createPool(sub: string, title: string, gameUrl: string) {
    const pool = await PoolService.deploy(sub, title);

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

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getSuggestion(content: string, length: number) {
    if (!content) return;

    const prompt = `You are a content writer for games. Please rephrase this text in a short, engaging and active form. Apply a maximum character length of ${length} characters:`;
    const data = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt + content }],
    });

    return {
        content: data.choices[0].message.content,
        tokensUsed: Number(data.usage.total_tokens),
    };
}
async function getTwitterTWeet(tweetId: string) {
    const { data } = await twitterClient({
        method: 'GET',
        url: `/tweets`,
        params: {
            ids: tweetId,
            expansions: 'author_id',
        },
    });
    return data.data;
}
async function getTwitterUser(username: string) {
    const { data } = await twitterClient({
        method: 'GET',
        url: `/users/by/username/${username}`,
        params: {
            'user.fields': 'profile_image_url',
        },
    });
    return data.data;
}

export { readCSV, getYoutubeID, getTwitterUsername, createPool, getSuggestion, getTwitterTWeet, getTwitterUser };
