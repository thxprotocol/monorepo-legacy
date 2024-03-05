import path from 'path';
import fs from 'fs';
import { MongoClient, Db } from 'mongodb';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { QuestSocialEntry } from '@thxnetwork/api/models/QuestSocialEntry';
import {
    ERC1155Token,
    ERC20Token,
    ERC721Token,
    Participant,
    Pool,
    QuestCustomEntry,
    QuestDailyEntry,
    QuestGitcoinEntry,
    QuestWeb3Entry,
    RewardCoinPayment,
    RewardCouponPayment,
    RewardCustomPayment,
    RewardDiscordRolePayment,
    RewardNFTPayment,
} from '@thxnetwork/api/models';

export default async function main() {
    const filePath = path.join(__dirname, '../../../metamask-accounts.csv');
    const client = new MongoClient(process.env.MONGODB_URI_AUTH_PROD);

    await client.connect();

    const db: Db = client.db('auth-prod');
    const accounts = await db.collection('accounts').find({ variant: 4 }).toArray();
    const subs = accounts.map(({ _id }) => String(_id));
    const wallets = await Wallet.find({
        sub: { $in: subs },
        address: { $exists: true },
        $and: [{ version: { $exists: false } }, { safeVersion: { $exists: false } }],
    });
    const participants = await Participant.find({ sub: { $in: subs } });
    const poolIds = participants.map((p) => p.poolId);
    const pools = await Pool.find({ _id: { $in: poolIds } });

    const csvData = await Promise.all(
        accounts.map(async (account) => {
            const sub = String(account._id);
            const w = wallets.find((p) => p.sub === sub);
            const p = participants.find((p) => p.sub === sub);
            const pool = p && pools.find((pool) => String(pool._id) === p.poolId);

            const [
                dailyCount,
                socialCount,
                customCount,
                web3Count,
                gitcoinCount,
                erc20Count,
                erc721Count,
                erc1155Count,
                coinCount,
                nftCount,
                discordCount,
                customrewardCount,
                couponCount,
            ] = await Promise.all(
                [
                    QuestDailyEntry,
                    QuestSocialEntry,
                    QuestCustomEntry,
                    QuestWeb3Entry,
                    QuestGitcoinEntry,
                    // Coins
                    ERC20Token,
                    // NFT
                    ERC721Token,
                    ERC1155Token,
                    // RewardPayments
                    RewardCoinPayment,
                    RewardNFTPayment,
                    RewardDiscordRolePayment,
                    RewardCustomPayment,
                    RewardCouponPayment,
                ].map((Model) => Model.countDocuments({ sub })),
            );

            return [
                sub,
                pool && pool.settings && pool.settings.title,
                p && p.balance,
                p && p.score,
                p && p.questEntryCount,
                p && p.updatedAt,
                w && w.address,
                dailyCount,
                socialCount,
                customCount,
                web3Count,
                gitcoinCount,
                erc20Count,
                erc721Count,
                erc1155Count,
                coinCount,
                nftCount,
                discordCount,
                customrewardCount,
                couponCount,
            ].join(',');
        }),
    );

    csvData.push(
        [
            'sub',
            'campaign',
            'balance',
            'score',
            'questEntryCount',
            'updatedAt',
            'address',
            'dailyCount',
            'socialCount',
            'customCount',
            'web3Count',
            'gitcoinCoun',
            'erc20Count',
            'erc721Count',
            'erc1155Count',
            'coinCount',
            'nftCount',
            'discordCount',
            'customrewardCount',
            'couponCount',
        ].join(','),
    );

    fs.writeFileSync(filePath, csvData.reverse().join('\n'), 'utf8');
}
// This query finds all wallets that have an address and do not have a version nor safeVersion field. Indicating they are metamask wallets
// { $and: [{ version: { $exists: false} }, { safeVersion: { $exists: false } }], sub: { $exists: true }, poolId: { $exists: true } }
