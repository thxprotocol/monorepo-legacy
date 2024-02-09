import { TAccount, TMilestoneReward, TMilestoneRewardClaim, TValidationResult } from '@thxnetwork/types/index';
import { MilestoneReward, MilestoneRewardDocument } from '../models/MilestoneReward';
import { Identity } from '../models/Identity';
import { Event } from '../models/Event';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import { WalletDocument } from '../models/Wallet';
import { IQuestService } from './interfaces/IQuestService';

export default class QuestCustomService implements IQuestService {
    models = {
        quest: MilestoneReward,
        entry: MilestoneRewardClaim,
    };

    async isAvailable({
        quest,
        wallet,
    }: {
        quest: MilestoneRewardDocument;
        wallet?: WalletDocument;
        account?: TAccount;
        data: Partial<TMilestoneRewardClaim>;
    }): Promise<TValidationResult> {
        const entries = await this.findEntries({ quest, wallet });
        if (quest.limit && entries.length >= quest.limit) {
            return { result: false, reason: 'Quest entry limit has been reached.' };
        }

        return { result: true, reason: '' };
    }

    async getAmount({ quest }: { quest: MilestoneRewardDocument; wallet: WalletDocument; account: TAccount }) {
        return quest.amount;
    }

    async findEntries({ quest, wallet }: { quest: MilestoneRewardDocument; wallet: WalletDocument }) {
        if (!wallet) return [];
        return MilestoneRewardClaim.find({
            questId: quest._id,
            walletId: wallet._id,
            isClaimed: true,
        });
    }

    async decorate({
        quest,
        account,
        wallet,
        data,
    }: {
        quest: MilestoneRewardDocument;
        account?: TAccount;
        wallet?: WalletDocument;
        data: Partial<TMilestoneRewardClaim>;
    }) {
        const entries = await this.findEntries({ quest, wallet });
        const identities = wallet ? await Identity.find({ poolId: quest.poolId, sub: wallet.sub }) : [];
        const identityIds = identities.map(({ _id }) => String(_id));
        const events = identityIds.length ? await Event.find({ name: quest.eventName, identityId: identityIds }) : [];
        const pointsAvailable = (quest.limit - entries.length) * quest.amount;
        const isAvailable = await this.isAvailable({ quest, wallet, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            pointsAvailable,
            entries,
            events,
        };
    }

    async getValidationResult(options: {
        quest: TMilestoneReward;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TMilestoneRewardClaim>;
    }): Promise<{ reason: string; result: boolean }> {
        // See if there are identities
        const identities = await Identity.find({ poolId: options.quest.poolId, sub: options.wallet.sub });
        if (!identities.length) {
            return {
                result: false,
                reason: 'No identity connected to this account. Please ask for this in your community!',
            };
        }

        const entries = await MilestoneRewardClaim.find({
            questId: options.quest._id,
            walletId: options.wallet._id,
            isClaimed: true,
        });
        if (options.quest.limit && entries.length >= options.quest.limit) {
            return { result: false, reason: 'Quest entry limit has been reached' };
        }

        const events = await Event.find({
            identityId: { $in: identities.map(({ _id }) => String(_id)) },
            poolId: options.quest.poolId,
            name: options.quest.eventName,
        });
        if (entries.length >= events.length) {
            return { result: false, reason: 'Insufficient custom events found for this quest' };
        }
        if (entries.length < events.length) return { result: true, reason: '' };
    }
}
