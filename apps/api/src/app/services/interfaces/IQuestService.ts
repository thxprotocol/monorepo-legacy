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
    decorate(options: { quest: TQuest; wallet?: WalletDocument }): Promise<TQuest>;
    isAvailable(options: { quest: TQuest; wallet: WalletDocument; account: TAccount }): Promise<boolean>;
    getAmount(options: {
        quest: TQuest;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<{ pointsAvailable: number; pointsClaimed?: number }>;
    createEntry(options: Partial<TQuestEntry>): Promise<TQuestEntry>;
    getValidationResult(options: {
        quest: TQuest;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TQuestEntry>;
    }): Promise<TValidationResult>;
    models: { quest: Model<TQuest>; entry: Model<TQuestEntry> };
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
