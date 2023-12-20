import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { THXWidget } from '@thxnetwork/sdk/clients';

export function initWidget(campaignId: string) {
    return THXWidget.create({ apiUrl: API_URL, campaignId });
}
