import WalletProxy from '@thxnetwork/auth/proxies/WalletProxy';
import { ChainId } from '@thxnetwork/auth/types/enums/chainId';
import { AccountDocument } from '../models/Account';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { NODE_ENV } from '../config/secrets';

export async function createWallet(account: AccountDocument) {
    if (account.variant === AccountVariant.Metamask) return;

    const sub = String(account._id);
    const chains = [];

    if (NODE_ENV === 'production') {
        chains.push(ChainId.Polygon);
    } else {
        chains.push(ChainId.Hardhat);
    }

    for (const chainId of chains) {
        const walletsCount = (await WalletProxy.get(sub, chainId)).length;
        if (!walletsCount) WalletProxy.create(sub, chainId, false);
    }
}
