import { QuestWeb3Entry, QuestWeb3 } from '@thxnetwork/api/models';
import { BigNumber, ethers } from 'ethers';
import { logger } from '@thxnetwork/api/util/logger';
import { IQuestService } from './interfaces/IQuestService';

export default class QuestWeb3Service implements IQuestService {
    models = {
        quest: QuestWeb3,
        entry: QuestWeb3Entry,
    };

    findEntryMetadata(options: { quest: TQuestWeb3 }) {
        return {};
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: TQuestWeb3;
        data: Partial<TQuestWeb3Entry>;
        account?: TAccount;
    }): Promise<TQuestWeb3 & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            amount: quest.amount,
            contracts: quest.contracts,
            methodName: quest.methodName,
            threshold: quest.threshold,
        };
    }

    async isAvailable({
        quest,
        account,
        data,
    }: {
        quest: TQuestWeb3;
        account: TAccount;
        data: Partial<TQuestWeb3Entry>;
    }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };

        const ids: any[] = [{ sub: account.sub }];
        if (data.metadata && data.metadata.address) ids.push({ 'metadata.address': data.metadata.address });

        const isCompleted = await QuestWeb3Entry.exists({
            questId: quest._id,
            $or: ids,
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest with this account and/or address already.' };
    }

    async getAmount({ quest }: { quest: TQuestWeb3; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        account,
        data,
    }: {
        quest: TQuestWeb3;
        account: TAccount;
        data: Partial<TQuestWeb3Entry>;
    }): Promise<TValidationResult> {
        const isCompleted = await QuestWeb3Entry.exists({
            questId: quest._id,
            $or: [{ sub: account.sub }, { 'metadata.address': data.metadata.address }],
        });
        if (isCompleted) return { result: false, reason: 'You have claimed this quest already' };

        const threshold = BigNumber.from(quest.threshold);
        const result = BigNumber.from(data.metadata.callResult);
        if (result.lt(threshold)) {
            return { result: false, reason: 'Result does not meet the threshold' };
        }

        return { result: true, reason: '' };
    }

    static async getCallResult({
        quest,
        data,
    }: {
        quest: TQuestWeb3;
        account: TAccount;
        data: Partial<TQuestWeb3Entry>;
    }) {
        const { rpc, chainId, address } = data.metadata;
        const contract = quest.contracts.find((c) => c.chainId === chainId);
        if (!contract) return { result: false, reason: 'Smart contract not found.' };

        const contractInstance = new ethers.Contract(
            contract.address,
            ['function ' + quest.methodName + '(address) view returns (uint256)'],
            new ethers.providers.JsonRpcProvider(rpc),
        );

        try {
            const value = await contractInstance[quest.methodName](address);

            return { result: true, reason: '', value };
        } catch (error) {
            logger.error(error);
            return { result: false, reason: `Smart contract call on ${quest.methodName} failed` };
        }
    }
}
