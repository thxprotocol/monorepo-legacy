import { Model } from 'mongoose';
import { QuestVariant } from '@thxnetwork/types/enums';
import { TAccount, TQuest, TQuestEntry, TValidationResult } from '@thxnetwork/types/interfaces';
import { WalletDocument } from '../../models/Wallet';

import QuestInviteService from '../QuestInviteService';
import QuestDiscordService from '../QuestDiscordService';
import QuestTwitterService from '../QuestSocialService'; // Split
import QuestYouTubeService from '../QuestSocialService'; // Split
import QuestDailyService from '../QuestDailyService';
import QuestCustomService from '../QuestCustomService';
import QuestGitcoinService from '../QuestGitcoinService';
import QuestWeb3Service from '../QuestWeb3Service';

export interface IQuestService {
    models: { quest: Model<TQuest>; entry: Model<TQuestEntry> };
    decorate(options: { quest: TQuest; wallet?: WalletDocument; account?: TAccount }): Promise<TQuest>;
    isAvailable(options: { quest: TQuest; wallet: WalletDocument; account: TAccount }): Promise<TValidationResult>;
    getAmount(options: { quest: TQuest; wallet: WalletDocument; account: TAccount }): Promise<number>;
    getValidationResult(options: {
        quest: TQuest;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TQuestEntry>;
    }): Promise<TValidationResult>;
}

export const serviceMap: {
    [variant: number]: IQuestService;
} = {
    [QuestVariant.Daily]: new QuestDailyService(),
    [QuestVariant.Invite]: new QuestInviteService(),
    [QuestVariant.Discord]: new QuestDiscordService(),
    [QuestVariant.Twitter]: new QuestTwitterService(),
    [QuestVariant.YouTube]: new QuestYouTubeService(),
    [QuestVariant.Custom]: new QuestCustomService(),
    [QuestVariant.Web3]: new QuestWeb3Service(),
    [QuestVariant.Gitcoin]: new QuestGitcoinService(),
};
