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
    TQuestEntry,
} from '@thxnetwork/common/lib/types/interfaces';
import { GitcoinQuest } from '../models/GitcoinQuest';
import { IQuestService } from './interfaces/IQuestService';
import GitcoinService from './GitcoinService';

export default class QuestGitcoinService implements IQuestService {
    models = {
        quest: GitcoinQuest,
        entry: GitcoinQuestEntry,
    };

    async decorate({
        quest,
        wallet,
        account,
        data,
    }: {
        quest: TGitcoinQuest;
        account?: TAccount;
        wallet?: WalletDocument;
        data: Partial<TGitcoinQuestEntry>;
    }): Promise<TGitcoinQuest & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, wallet, account, data });
        return { ...quest, isAvailable: isAvailable.result };
    }

    async isAvailable({
        quest,
        wallet,
        data,
    }: {
        quest: TGitcoinQuest;
        wallet?: WalletDocument;
        account?: TAccount;
        data: Partial<TGitcoinQuestEntry>;
    }): Promise<TValidationResult> {
        if (!wallet) return { result: true, reason: '' };

        const ids = [];
        if (wallet) ids.push({ sub: wallet.sub });
        if (wallet) ids.push({ walletId: wallet._id });
        if (data && data.address) ids.push({ address: data.address });

        const isCompleted = await GitcoinQuestEntry.exists({
            questId: quest._id,
            $or: ids,
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest with this account and/or address already.' };
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
        if (!data.address) return { result: false, reason: 'Could not find an address during validation.' };

        const { score, error } = await GitcoinService.getScoreUniqueHumanity(
            quest.scorerId,
            data.address.toLowerCase(),
        );
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
