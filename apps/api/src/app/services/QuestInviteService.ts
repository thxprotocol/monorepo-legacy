import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
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

    list(options: { pool: AssetPoolDocument }): Promise<TReferralReward[]> {
        throw new Error('Method not implemented.');
    }

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
    }): Promise<boolean> {
        return true;
    }

    async getAmount({
        quest,
    }: {
        quest: TReferralReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<{ pointsAvailable: number; pointsClaimed?: number }> {
        return { pointsAvailable: quest.amount };
    }

    findById(id: string): Promise<TReferralReward> {
        throw new Error('Method not implemented.');
    }

    updateById(id: string, options: Partial<TReferralReward>): Promise<TReferralReward> {
        throw new Error('Method not implemented.');
    }

    create(options: Partial<TReferralReward>): Promise<TReferralReward> {
        throw new Error('Method not implemented.');
    }

    createEntry(options: Partial<TReferralRewardClaim>): Promise<TReferralRewardClaim> {
        throw new Error('Method not implemented.');
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
