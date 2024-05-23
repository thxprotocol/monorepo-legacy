import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { THXWidget } from '@thxnetwork/sdk';

export function initWidget(campaignId: string, containerSelector: string) {
    return THXWidget.create({ apiUrl: API_URL, campaignId, containerSelector });
}
