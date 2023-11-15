import { PKG_ENV } from '@thxnetwork/dashboard/config/secrets';
import { THXWidget } from '@thxnetwork/sdk/client/index';

export function initWidget(poolId: string) {
    return new THXWidget({ env: PKG_ENV, poolId });
}
