import { NotFoundError } from '@thxnetwork/api/util/errors';
import db from '@thxnetwork/api/util/database';
import { TMilestoneReward } from '@thxnetwork/types/index';
import { AssetPoolDocument } from '../models/AssetPool';
import { MilestoneReward, MilestoneRewardDocument } from '../models/MilestoneReward';
import { paginatedResults } from '../util/pagination';
import { Identity } from '../models/Identity';
import { Event } from '../models/Event';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import { WalletDocument } from '../models/Wallet';

async function create(pool: AssetPoolDocument, payload: Partial<TMilestoneReward>) {
    return await MilestoneReward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

async function edit(uuid: string, payload: Partial<TMilestoneReward>) {
    const reward = await MilestoneReward.findById(uuid);
    if (!reward) throw new NotFoundError('Cannot find Milestone Perk with this UUID');

    Object.keys(payload).forEach((key) => {
        if (payload[key]) reward[key] = payload[key];
    });

    await reward.save();
    return reward;
}

async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
    const result = await paginatedResults(MilestoneReward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

async function validate(quest: MilestoneRewardDocument, wallet: WalletDocument) {
    try {
        // See if there are identities
        const identities = await Identity.find({ poolId: quest.poolId, sub: wallet.sub });
        if (!identities.length) {
            throw new Error('No identity connected to this account');
        }

        const entries = await MilestoneRewardClaim.find({
            questId: quest._id,
            walletId: wallet._id,
            isClaimed: true,
        });
        if (entries.length >= quest.limit) {
            throw new Error('Quest entry limit has been reached');
        }

        const events = await Event.find({
            identityId: { $in: identities.map(({ _id }) => String(_id)) },
            poolId: quest.poolId,
            name: quest.eventName,
        });
        if (entries.length >= events.length) {
            throw new Error('Insufficient custom events found for this quest');
        }

        return { result: true, reason: '' };
    } catch (error) {
        return { result: false, reason: error.message };
    }
}

async function findOne(quest: MilestoneRewardDocument, wallet?: WalletDocument) {
    const entries = wallet
        ? await MilestoneRewardClaim.find({
              walletId: String(wallet._id),
              questId: String(quest._id),
              isClaimed: true,
          })
        : [];
    const identities = wallet ? await Identity.find({ poolId: quest.poolId, sub: wallet.sub }) : [];
    const identityIds = identities.map(({ _id }) => String(_id));
    const events = identityIds.length ? await Event.find({ name: quest.eventName, identityId: identityIds }) : [];
    const pointsAvailable = (quest.limit - entries.length) * quest.amount;

    return {
        ...quest.toJSON(),
        limit: quest.limit,
        amount: quest.amount,
        pointsAvailable,
        claims: entries,
        events,
    };
}

export default { findOne, validate, create, edit, findByPool };
