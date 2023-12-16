import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { THXWidget } from '@thxnetwork/sdk/clients';

export function initWidget(poolId: string) {
    return new THXWidget({ url: API_URL, poolId });
}
