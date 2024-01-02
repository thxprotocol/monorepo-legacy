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

export default {
    async create(pool: AssetPoolDocument, payload: Partial<TMilestoneReward>) {
        return await MilestoneReward.create({
            poolId: String(pool._id),
            uuid: db.createUUID(),
            ...payload,
        });
    },

    async edit(uuid: string, payload: Partial<TMilestoneReward>) {
        const reward = await MilestoneReward.findById(uuid);
        if (!reward) throw new NotFoundError('Cannot find Milestone Perk with this UUID');

        Object.keys(payload).forEach((key) => {
            if (payload[key]) reward[key] = payload[key];
        });

        await reward.save();
        return reward;
    },

    async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const result = await paginatedResults(MilestoneReward, page, limit, {
            poolId: assetPool._id,
        });
        result.results = result.results.map((r) => r.toJSON());
        return result;
    },

    async validate(quest: MilestoneRewardDocument, wallet: WalletDocument) {
        try {
            const identity = await Identity.findOne({ poolId: quest.poolId, sub: wallet.sub });
            if (!identity) {
                throw new Error('No identity connected to this account');
            }

            const entries = await MilestoneRewardClaim.find({
                milestoneRewardId: quest._id,
                walletId: wallet._id,
                isClaimed: true,
            });
            if (entries.length >= quest.limit) {
                throw new Error('Quest entry limit has been reached');
            }

            const events = await Event.find({ identityId: identity._id, poolId: quest.poolId });
            if (entries.length >= events.length) {
                throw new Error('Insufficient custom events found for this quest');
            }

            return { result: true, reason: '' };
        } catch (error) {
            return { result: false, reason: error.message };
        }
    },
};
