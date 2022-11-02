import WalletProxy from '@thxnetwork/auth/proxies/WalletProxy';
import { ChainId } from '@thxnetwork/auth/types/enums/chainId';
import { NODE_ENV } from '@thxnetwork/auth/config/secrets';

export async function createWallet(sub: string, chainIds: ChainId[] = []) {
    if (NODE_ENV !== 'production') {
        chainIds.push(ChainId.Hardhat);
    } else {
        chainIds = chainIds.concat([ChainId.PolygonMumbai, ChainId.Polygon]);
    }
    await Promise.all(
        chainIds.filter(async (chainId: ChainId) => {
            const walletsCount = (await WalletProxy.get(sub, chainId)).length;
            if (!walletsCount) {
                return WalletProxy.create(sub, chainId, false);
            }
        }),
    );
}
