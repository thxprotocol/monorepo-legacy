import { WalletDocument } from '../models/Wallet';
import { TAccount, TReferralReward, TReferralRewardClaim, TValidationResult } from '@thxnetwork/common/lib/types';
import { ReferralRewardClaim } from '../models/ReferralRewardClaim';
import { ReferralReward } from '../models/ReferralReward';
import { IQuestService } from './interfaces/IQuestService';

export default class QuestInviteService implements IQuestService {
    models = {
        quest: ReferralReward,
        entry: ReferralRewardClaim,
    };

    async decorate({ quest }: { quest: TReferralReward; wallet?: WalletDocument }): Promise<TReferralReward> {
        return {
            ...quest,
            pathname: quest.pathname,
            successUrl: quest.successUrl,
        };
    }

    async isAvailable(options: {
        quest: TReferralReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<TValidationResult> {
        return { result: false, reason: 'Not implemented' };
    }

    async getAmount({ quest }: { quest: TReferralReward; wallet: WalletDocument; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult(options: {
        quest: TReferralReward;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TReferralRewardClaim>;
    }): Promise<TValidationResult> {
        return {
            result: false,
            reason: 'Sorry, support not yet implemented...',
        };
    }
}
