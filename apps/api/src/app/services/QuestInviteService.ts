import { QuestInvite, QuestInviteEntry } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';

export default class QuestInviteService implements IQuestService {
    models = {
        quest: QuestInvite,
        entry: QuestInviteEntry,
    };

    findEntryMetadata(options: { quest: TQuestInvite }) {
        return {};
    }

    async decorate({ quest }: { quest: TQuestInvite; data: Partial<TQuestInviteEntry> }): Promise<TQuestInvite> {
        return {
            ...quest,
            pathname: quest.pathname,
            successUrl: quest.successUrl,
        };
    }

    async isAvailable(options: {
        quest: TQuestInvite;
        account?: TAccount;
        data: Partial<TQuestInviteEntry>;
    }): Promise<TValidationResult> {
        return { result: false, reason: 'Not implemented' };
    }

    async getAmount({ quest }: { quest: TQuestInvite; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult(options: {
        quest: TQuestInvite;
        account: TAccount;
        data: Partial<TQuestInviteEntry>;
    }): Promise<TValidationResult> {
        return {
            result: false,
            reason: 'Sorry, support not yet implemented...',
        };
    }
}
