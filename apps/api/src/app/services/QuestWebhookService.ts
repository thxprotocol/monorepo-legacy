import {
    QuestWebhook,
    QuestWebhookDocument,
    QuestWebhookEntry,
    Identity,
    WalletDocument,
    Webhook,
} from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import WebhookService from './WebhookService';

export default class QuestWebhookService implements IQuestService {
    models = {
        quest: QuestWebhook,
        entry: QuestWebhookEntry,
    };

    async findEntryMetadata({ quest }: { quest: QuestWebhookDocument }) {
        const uniqueParticipantIds = await QuestWebhookEntry.countDocuments({
            questId: String(quest._id),
        }).distinct('sub');

        return { participantCount: uniqueParticipantIds.length };
    }

    async isAvailable({
        quest,
        account,
    }: {
        quest: QuestWebhookDocument;
        wallet?: WalletDocument;
        account?: TAccount;
        data: Partial<TQuestWebhookEntry>;
    }): Promise<TValidationResult> {
        const entries = await this.findAllEntries({ quest, account });
        if (entries.length) {
            return { result: false, reason: 'Quest entry limit has been reached.' };
        }

        return { result: true, reason: '' };
    }

    async getAmount({ quest }: { quest: QuestWebhookDocument; wallet: WalletDocument; account: TAccount }) {
        return quest.amount;
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: QuestWebhookDocument;
        account?: TAccount;
        data: Partial<TQuestWebhookEntry>;
    }) {
        const entries = await this.findAllEntries({ quest, account });
        const identities = await this.findIdentities({ quest, account });
        const isAvailable = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            eventName: '', // FK Deprecrates March 15th 2024
            isAvailable: isAvailable.result,
            entries,
        };
    }

    async getValidationResult({
        quest,
        account,
    }: {
        quest: QuestWebhookDocument;
        account: TAccount;
        data: Partial<TQuestWebhookEntry>;
    }): Promise<{ reason: string; result: boolean }> {
        // See if there are identities
        const identities = await this.findIdentities({ quest, account });
        if (!identities.length) {
            return {
                result: false,
                reason: 'No identity connected to this account. Please ask for this in your community!',
            };
        }

        const webhook = await Webhook.findById(quest.webhookId);
        if (!webhook) return { result: false, reason: 'Webhook no longer available.' };

        await WebhookService.request(webhook);

        return { result: true, reason: '' };
    }

    private async findAllEntries({ quest, account }: { quest: QuestWebhookDocument; account: TAccount }) {
        if (!account) return [];
        return await this.models.entry.find({
            questId: quest._id,
            sub: account.sub,
            isClaimed: true,
        });
    }

    private async findIdentities({ quest, account }: { quest: QuestWebhookDocument; account: TAccount }) {
        if (!account || !account.sub) return [];
        return await Identity.find({ poolId: quest.poolId, sub: account.sub });
    }
}
