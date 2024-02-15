import { TAccount, TReferralReward, TReferralRewardClaim, TValidationResult } from '@thxnetwork/common/lib/types';
import { ReferralRewardClaim } from '../models/ReferralRewardClaim';
import { ReferralReward } from '../models/ReferralReward';
import { IQuestService } from './interfaces/IQuestService';

export default class QuestInviteService implements IQuestService {
    models = {
        quest: ReferralReward,
        entry: ReferralRewardClaim,
    };

    findEntryMetadata(options: { quest: TReferralReward }) {
        return {};
    }

    async decorate({
        quest,
    }: {
        quest: TReferralReward;
        data: Partial<TReferralRewardClaim>;
    }): Promise<TReferralReward> {
        return {
            ...quest,
            pathname: quest.pathname,
            successUrl: quest.successUrl,
        };
    }

    async isAvailable(options: {
        quest: TReferralReward;
        account?: TAccount;
        data: Partial<TReferralRewardClaim>;
    }): Promise<TValidationResult> {
        return { result: false, reason: 'Not implemented' };
    }

    async getAmount({ quest }: { quest: TReferralReward; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult(options: {
        quest: TReferralReward;
        account: TAccount;
        data: Partial<TReferralRewardClaim>;
    }): Promise<TValidationResult> {
        return {
            result: false,
            reason: 'Sorry, support not yet implemented...',
        };
    }
}
