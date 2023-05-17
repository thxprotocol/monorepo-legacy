import WalletProxy from '@thxnetwork/auth/proxies/WalletProxy';
import { ChainId } from '@thxnetwork/types/enums';
import { AccountDocument } from '../models/Account';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { NODE_ENV } from '../config/secrets';

export async function createWallet(account: AccountDocument) {
    const skipDeploy = account.variant === AccountVariant.Metamask;
    const chains = [NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat];
    const sub = String(account._id);

    for (const chainId of chains) {
        const [wallet] = await WalletProxy.get(sub, chainId);
        if (wallet) continue;
        WalletProxy.create({ sub, chainId, forceSync: false, skipDeploy, address: account.address });
    }
}
