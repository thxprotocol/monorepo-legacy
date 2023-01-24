import WalletProxy from '@thxnetwork/auth/proxies/WalletProxy';
import { ChainId } from '@thxnetwork/auth/types/enums/chainId';
import { AccountDocument } from '../models/Account';
import { AccountVariant } from '../types/enums/AccountVariant';
import { NODE_ENV } from '../config/secrets';

export async function createWallet(account: AccountDocument) {
    if (account.variant === AccountVariant.Metamask) return;

    const sub = String(account._id);
    const chains = [ChainId.Polygon];

    if (NODE_ENV === 'development') {
        chains.push(ChainId.Hardhat);
    }

    for (const chainId of chains) {
        const walletsCount = (await WalletProxy.get(sub, chainId)).length;
        if (!walletsCount) return WalletProxy.create(sub, chainId, false);
    }
}
