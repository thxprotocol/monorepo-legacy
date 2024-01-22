import { AccessTokenKind, ChainId, CollaboratorInviteState } from '@thxnetwork/types/enums';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { PoolSubscription, PoolSubscriptionDocument } from '../models/PoolSubscription';
import { logger } from '../util/logger';
import { TAccount } from '@thxnetwork/types/interfaces';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { v4 } from 'uuid';
import { DailyReward } from '../models/DailyReward';
import { ReferralReward } from '../models/ReferralReward';
import { PointReward } from '../models/PointReward';
import { MilestoneReward } from '../models/MilestoneReward';
import { ERC20Perk } from '../models/ERC20Perk';
import { ERC721Perk } from '../models/ERC721Perk';
import { getsigningSecret } from '../util/signingsecret';
import { Web3Quest } from '../models/Web3Quest';
import { CustomReward } from '../models/CustomReward';
import { Participant } from '../models/Participant';
import { PointBalance } from './PointBalanceService';
import { Collaborator, CollaboratorDocument } from '../models/Collaborator';
import { DASHBOARD_URL } from '../config/secrets';
import { WalletDocument } from '../models/Wallet';
import { PointBalanceDocument } from '../models/PointBalance';
import { Widget } from '../models/Widget';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/types/contants';
import AccountProxy from '../proxies/AccountProxy';
import MailService from './MailService';
import SafeService from './SafeService';
import DiscordGuild from '../models/DiscordGuild';
import DiscordDataProxy from '../proxies/DiscordDataProxy';

export const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

function isPoolClient(clientId: string, poolId: string) {
    return AssetPool.exists({ _id: poolId, clientId });
}

async function hasAccess(sub: string, poolId: string) {
    const isOwner = await AssetPool.exists({
        _id: poolId,
        sub,
    });
    const isCollaborator = await Collaborator.exists({ sub, poolId, state: CollaboratorInviteState.Accepted });
    return isOwner || isCollaborator;
}

async function getById(id: string) {
    const pool = await AssetPool.findById(id);
    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    pool.safe = safe;
    pool.address = safe && safe.address;
    return pool;
}

function getByAddress(address: string) {
    return AssetPool.findOne({ address });
}

async function deploy(
    sub: string,
    chainId: ChainId,
    title: string,
    startDate: Date,
    endDate?: Date,
): Promise<AssetPoolDocument> {
    const pool = await AssetPool.create({
        sub,
        chainId,
        version: currentVersion,
        token: v4(),
        signingSecret: getsigningSecret(64),
        settings: {
            title,
            description: '',
            startDate,
            endDate,
            isArchived: false,
            isWeeklyDigestEnabled: true,
            isTwitterSyncEnabled: false,
            defaults: {
                conditionalRewards: { title: '', description: '', amount: 50 },
            },
            authenticationMethods: [
                AccountVariant.EmailPassword,
                AccountVariant.Metamask,
                AccountVariant.SSOGoogle,
                AccountVariant.SSODiscord,
            ],
        },
    });

    await Widget.create({
        uuid: v4(),
        poolId: pool._id,
        align: 'right',
        message: 'Hi there!👋 Click me to complete quests and earn rewards...',
        domain: 'https://www.example.com',
        theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
    });

    return AssetPool.findByIdAndUpdate(pool._id, { 'settings.slug': String(pool._id) }, { new: true });
}

async function getAllBySub(sub: string) {
    const pools = await AssetPool.find({ sub });
    // Only query for collabs of not already owned pools
    const collaborations = await Collaborator.find({ sub, poolId: { $nin: pools.map(({ _id }) => String(_id)) } });
    const poolIds = collaborations.map((c) => c.poolId);
    if (!poolIds.length) return pools;

    const collaborationPools = await AssetPool.find({
        _id: poolIds,
    });

    return pools.concat(collaborationPools);
}

function getAll() {
    return AssetPool.find({});
}

async function countByNetwork(chainId: ChainId) {
    return AssetPool.countDocuments({ chainId });
}

async function find(model: any, pool: AssetPoolDocument) {
    return await model.find({ poolId: String(pool._id) });
}

async function getQuestCount(pool: AssetPoolDocument) {
    const result = await Promise.all(
        [DailyReward, ReferralReward, PointReward, MilestoneReward, Web3Quest].map(
            async (model) => await find(model, pool),
        ),
    );
    return Array.from(new Set(result.flat(1)));
}

async function getRewardCount(pool: AssetPoolDocument) {
    const result = await Promise.all(
        [ERC20Perk, ERC721Perk, CustomReward].map(async (model) => await find(model, pool)),
    );
    return Array.from(new Set(result.flat(1)));
}

async function findParticipants(pool: AssetPoolDocument, page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Participant.find({ poolId: pool._id }).countDocuments().exec();
    const participants = {
        previous: startIndex > 0 && {
            page: page - 1,
        },
        next: endIndex < total && {
            page: page + 1,
        },
        total,
        results: await Participant.aggregate([
            { $match: { poolId: String(pool._id) } },
            {
                $addFields: {
                    rankSort: {
                        $cond: {
                            if: { $gt: ['$rank', 0] },
                            then: '$rank',
                            else: Number.MAX_SAFE_INTEGER,
                        },
                    },
                },
            },
            { $sort: { rankSort: 1 } },
            { $skip: startIndex },
            { $limit: limit },
        ]).exec(),
    };

    const subs = participants.results.map((p) => p.sub);
    const accounts = await AccountProxy.getMany(subs);

    participants.results = await Promise.all(
        participants.results.map(async (participant) => {
            let wallet: WalletDocument,
                account: TAccount,
                subscription: PoolSubscriptionDocument,
                pointBalance: PointBalanceDocument;

            try {
                wallet = await SafeService.findPrimary(participant.sub, pool.chainId);
            } catch (error) {
                logger.error(error);
            }
            try {
                account = accounts.find((a) => a.sub === wallet.sub);
            } catch (error) {
                logger.error(error);
            }
            try {
                subscription = await PoolSubscription.findOne({ poolId: pool._id, sub: account.sub });
            } catch (error) {
                logger.error(error);
            }
            try {
                pointBalance =
                    wallet &&
                    (await PointBalance.findOne({
                        poolId: participant.poolId,
                        walletId: wallet._id,
                    }));
            } catch (error) {
                logger.error(error);
            }

            return {
                ...participant,
                account: account && {
                    email: account.email,
                    username: account.username,
                    profileImg: account.profileImg,
                    variant: account.variant,
                    connectedAccounts: account.connectedAccounts,
                },
                wallet,
                subscription,
                pointBalance: pointBalance ? pointBalance.balance : 0,
            };
        }),
    );

    return participants;
}

async function getParticipantCount(pool: AssetPoolDocument) {
    return await Participant.count({ poolId: pool._id });
}

async function inviteCollaborator(pool: AssetPoolDocument, email: string) {
    const uuid = v4();
    let collaborator = await Collaborator.findOne({ email, poolId: pool._id });

    if (collaborator) {
        collaborator = await Collaborator.findByIdAndUpdate(collaborator._id, { uuid }, { new: true });
    } else {
        collaborator = await Collaborator.create({
            email,
            uuid,
            poolId: pool._id,
            state: CollaboratorInviteState.Pending,
        });
    }

    const url = new URL(DASHBOARD_URL);
    url.pathname = 'collaborator';
    url.searchParams.append('poolId', pool._id);
    url.searchParams.append('collaboratorRequestToken', collaborator.uuid);

    await MailService.send(
        email,
        `👋 Collaboration Request: ${pool.settings.title}`,
        `<p>Hi!👋</p><p>You have received a collaboration request for Quest &amp; Reward campaign: <strong>${pool.settings.title}</strong></p>`,
        { src: url.href, text: 'Accept Request' },
    );

    return collaborator;
}

async function getAccountGuilds(sub: string) {
    // Try as this is potentially rate limited due to subsequent GET pool for id requests
    try {
        return await DiscordDataProxy.get(sub);
    } catch (error) {
        return { isAuthorized: false, guilds: [] };
    }
}

async function findGuilds(pool: AssetPoolDocument) {
    const { isAuthorized, guilds: userGuilds } = await getAccountGuilds(pool.sub);
    if (!isAuthorized) return [];

    const guilds = await DiscordGuild.find({ poolId: pool._id });
    const promises = userGuilds.map(async (userGuild: { id: string; name: string }) => {
        const guild = guilds.find(({ guildId }) => guildId === userGuild.id);
        return await DiscordDataProxy.getGuild({
            ...(guild && guild.toJSON()),
            ...userGuild,
            guildId: userGuild.id,
            poolId: pool._id,
            isConnected: !!guild,
        });
    });

    return await Promise.all(promises);
}

async function findCollaborators(pool: AssetPoolDocument) {
    const collabs = await Collaborator.find({ poolId: pool._id });
    const promises = collabs.map(async (collaborator: CollaboratorDocument) => {
        if (collaborator.sub) {
            const account = await AccountProxy.getById(collaborator.sub);
            return { ...collaborator.toJSON(), account };
        }
        return collaborator;
    });
    return await Promise.all(promises);
}

export default {
    isPoolClient,
    hasAccess,
    getById,
    getByAddress,
    deploy,
    getAllBySub,
    getAll,
    countByNetwork,
    getParticipantCount,
    getQuestCount,
    getRewardCount,
    findParticipants,
    findGuilds,
    findCollaborators,
    inviteCollaborator,
};
