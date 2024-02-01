import axios from 'axios';
import { WalletDocument } from '../models/Wallet';
import { GitcoinQuestEntry } from '../models/GitcoinQuestEntry';
import { GITCOIN_API_KEY } from '../config/secrets';
import { logger } from '../util/logger';
import {
    TAccount,
    TGitcoinQuestEntry,
    TGitcoinQuest,
    TValidationResult,
} from '@thxnetwork/common/lib/types/interfaces';
import { GitcoinQuest } from '../models/GitcoinQuest';
import { IQuestService } from './interfaces/IQuestService';
import GitcoinService from './GitcoinService';

export default class QuestGitcoinService implements IQuestService {
    models = {
        quest: GitcoinQuest,
        entry: GitcoinQuestEntry,
    };

    async decorate({ quest }: { quest: TGitcoinQuest; wallet?: WalletDocument }): Promise<TGitcoinQuest> {
        return quest;
    }

    async isAvailable({
        quest,
        wallet,
        address,
    }: {
        quest: TGitcoinQuest;
        wallet: WalletDocument;
        account: TAccount;
        address: string;
    }): Promise<boolean> {
        return !(await GitcoinQuestEntry.exists({
            questId: quest._id,
            $or: [{ sub: wallet.sub }, { walletId: wallet._id }, { address }],
        }));
    }

    async getAmount({ quest }: { quest: TGitcoinQuest; wallet: WalletDocument; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        data,
    }: {
        quest: TGitcoinQuest;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TGitcoinQuestEntry>;
    }): Promise<TValidationResult> {
        const { address } = data;
        const { score, error } = await GitcoinService.getScoreUniqueHumanity(quest.scorerId, address.toLowerCase());
        if (error) return { result: false, reason: error };
        if (score < quest.score) {
            return {
                result: false,
                reason: `Your score ${score || 0}/100 does not meet the minimum of ${quest.score}/100.`,
            };
        }
        if (score >= quest.score) return { result: true, reason: '' };
    }

    async getScore(scorerId: number, address: string) {
        try {
            const response = await axios({
                url: `https://api.scorer.gitcoin.co/registry/score/${scorerId}/${address}`,
                headers: { 'X-API-KEY': GITCOIN_API_KEY },
            });
            return { score: response.data.score };
        } catch (error) {
            logger.error(error.message);
            return { error: `Could not get a score for ${address}.` };
        }
    }
}
