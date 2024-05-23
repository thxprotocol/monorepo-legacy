import { AxiosRequestConfig } from 'axios';
import { QuestVariant } from './enums';

type THXQuestSocialYouTubePreviewData = {
    //
};

type THXQuestSocialDiscordPreviewData = {
    serverId: string;
    inviteURL: string;
    limit: number;
    days: number;
    channels: number;
};

type THXQuestSocialTwitterPreviewData = {
    minFollowersCount: number;
    url: string;
    username: string;
    name: string;
    text: string;
    id: string;
    profileImgUrl: string;
};

type THXQuestSocialCreateData = {
    amount: number;
    interaction: number;
    content: string;
    contentMetadata:
        | Partial<THXQuestSocialTwitterPreviewData>
        | Partial<THXQuestSocialDiscordPreviewData>
        | Partial<THXQuestSocialYouTubePreviewData>;
};

type THXQuestCreateData = {
    variant: QuestVariant;
    isPublished: boolean;
    title: string;
    description?: string;
    image?: string;
    expiryDate?: Date;
};

type THXAPIClientOptions = {
    apiUrl?: string;
    campaignId?: string;
} & THXOIDCConfig;

type THXIdentityClientOptions = {
    apiUrl?: string;
} & THXOIDCConfig;

type THXBrowserClientOptions = {
    apiUrl?: string;
    poolId: string;
} & THXOIDCConfig;

type THXRequestConfig = {
    poolId?: string;
} & AxiosRequestConfig;

type THXOIDCConfig = {
    authUrl?: string;
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
    identityCode?: string;
};

type THXOIDCUser = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
};

type THXWidgetOptions = {
    campaignId?: string;
    poolId?: string;
    apiUrl?: string;
    identity?: string;
    containerSelector?: string;
};

export {
    THXQuestSocialYouTubePreviewData,
    THXQuestSocialDiscordPreviewData,
    THXQuestSocialTwitterPreviewData,
    THXQuestCreateData,
    THXQuestSocialCreateData,
    THXWidgetOptions,
    THXAPIClientOptions,
    THXIdentityClientOptions,
    THXBrowserClientOptions,
    THXOIDCConfig,
    THXOIDCUser,
    THXRequestConfig,
};
