import { TAccount, TMilestoneReward, TMilestoneRewardClaim } from '@thxnetwork/types/index';
import { MilestoneReward, MilestoneRewardDocument } from '../models/MilestoneReward';
import { Identity } from '../models/Identity';
import { Event } from '../models/Event';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import { WalletDocument } from '../models/Wallet';
import { v4 } from 'uuid';
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
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<boolean> {
        return !!(await MilestoneRewardClaim.exists({
            walletId: String(wallet._id),
            questId: String(quest._id),
            isClaimed: true,
        }));
    }

    async getAmount({ quest }: { quest: MilestoneRewardDocument; wallet: WalletDocument; account: TAccount }) {
        return quest.amount;
    }

    async decorate({ quest, wallet }: { quest: TMilestoneReward; wallet?: WalletDocument }) {
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
            ...quest,
            limit: quest.limit,
            amount: quest.amount,
            pointsAvailable,
            claims: entries,
            events,
        };
    }

    async getValidationResult(options: {
        quest: TMilestoneReward;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TMilestoneRewardClaim>;
    }): Promise<{ reason: string; result: boolean }> {
        try {
            // See if there are identities
            const identities = await Identity.find({ poolId: options.quest.poolId, sub: options.wallet.sub });
            if (!identities.length) {
                throw new Error('No identity connected to this account. Please ask for this in your community!');
            }

            const entries = await MilestoneRewardClaim.find({
                questId: options.quest._id,
                walletId: options.wallet._id,
                isClaimed: true,
            });
            if (entries.length >= options.quest.limit) {
                throw new Error('Quest entry limit has been reached');
            }

            const events = await Event.find({
                identityId: { $in: identities.map(({ _id }) => String(_id)) },
                poolId: options.quest.poolId,
                name: options.quest.eventName,
            });
            if (entries.length >= events.length) {
                throw new Error('Insufficient custom events found for this quest');
            }

            return { result: true, reason: '' };
        } catch (error) {
            return { result: false, reason: error.message };
        }
    }
}
