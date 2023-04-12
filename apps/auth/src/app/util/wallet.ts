import WalletProxy from '@thxnetwork/auth/proxies/WalletProxy';
import { ChainId } from '@thxnetwork/auth/types/enums/chainId';
import { AccountDocument } from '../models/Account';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { NODE_ENV } from '../config/secrets';

export async function createWallet(account: AccountDocument) {
    const skipDeploy = account.variant === AccountVariant.Metamask;
    const chains = [NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat];
    const sub = String(account._id);

    for (const chainId of chains) {
        const wallets = await WalletProxy.get(sub, chainId);
        if (!wallets.length) {
            WalletProxy.create({ sub, chainId, forceSync: false, skipDeploy, address: account.address });
        }
    }
}
