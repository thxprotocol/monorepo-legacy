import { PKG_ENV, WIDGET_ID } from './secrets';
import { THXWidget } from '@thxnetwork/sdk/client/index';

export function initWidget() {
    return new THXWidget({ env: PKG_ENV, poolId: WIDGET_ID });
}
