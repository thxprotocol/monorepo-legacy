import WalletProxy from '@thxnetwork/auth/proxies/WalletProxy';
import { ChainId } from '@thxnetwork/auth/types/enums/chainId';
import { AccountDocument } from '../models/Account';
import { AccountVariant } from '../types/enums/AccountVariant';

export async function createWallet(account: AccountDocument) {
    if (account.variant === AccountVariant.Metamask) return;

    const sub = String(account._id);

    for (const chainId of [ChainId.Polygon, ChainId.Hardhat]) {
        const walletsCount = (await WalletProxy.get(sub, chainId)).length;
        if (!walletsCount) return WalletProxy.create(sub, chainId, false);
    }
}
