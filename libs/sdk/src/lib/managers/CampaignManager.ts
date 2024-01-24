import { THXAPIClient } from '../clients';
import { THXAPIClientOptions, THXQuestCreateData, THXQuestSocialCreateData } from '../types';
import BaseManager from './BaseManager';

class CampaignManager extends BaseManager {
    constructor(client: THXAPIClient) {
        super(client);
    }

    get(id: string) {
        return this.client.request.get(`/v1/pools/${id}`);
    }

    quests = {
        social: {
            create: (data: THXQuestCreateData & THXQuestSocialCreateData) => {
                const { campaignId } = this.client.options as THXAPIClientOptions;
                const contentMetadata = JSON.stringify(data.contentMetadata);

                return this.client.request.post(`/v1/pools/${campaignId}/quests`, {
                    data: { ...data, contentMetadata },
                });
            },
        },
    };
}

export default CampaignManager;
