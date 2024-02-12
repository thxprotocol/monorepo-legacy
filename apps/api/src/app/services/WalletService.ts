import { Wallet } from '@thxnetwork/api/models/Wallet';
import { TAccount, TWallet } from '@thxnetwork/common/lib/types';
import { TransactionState, WalletVariant } from '@thxnetwork/types/enums';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import SafeService from './SafeService';
import { safeVersion } from './ContractService';

export default class WalletService {
    static async list(account: TAccount) {
        const wallets = await Wallet.find({ sub: account.sub });

        return await Promise.all(
            wallets.map(async (wallet) => {
                const pendingTransactions = await Transaction.find({
                    walletId: String(wallet._id),
                    state: TransactionState.Confirmed,
                });
                const short = wallet.address && WalletService.formatAddress(wallet.address);

                return { ...wallet.toJSON(), short, pendingTransactions };
            }),
        );
    }

    static formatAddress(address: string) {
        return `${address.slice(0, 5)}...${address.slice(-3)}`;
    }

    static create(variant: WalletVariant, data: Partial<TWallet>) {
        const map = {
            [WalletVariant.Safe]: WalletService.createSafe,
            [WalletVariant.WalletConnect]: WalletService.createWalletConnect,
        };
        return map[variant](data);
    }

    static async createSafe({ sub, address, chainId }) {
        const safeWallet = await SafeService.findPrimary(sub);
        // An account can have max 1 Safe
        if (safeWallet) throw new Error('Already has a Safe.');

        // This query allows to take ownership of wallets owned by other subs as long as
        // the address can be verified.
        await Wallet.findOneAndUpdate(
            { variant: WalletVariant.Web3Auth, address, chainId },
            { variant: WalletVariant.Web3Auth, sub, address, chainId },
            { upsert: true },
        );

        // Deploy a Safe with Web3Auth address and relayer as signers
        await SafeService.create({ sub, chainId, safeVersion }, address);
    }

    static async createWalletConnect({ sub, address, chainId }) {
        // This query allows to take ownership of wallets owned by other subs as long as
        // the address can be verified.
        await Wallet.findOneAndUpdate(
            { address, chainId },
            { variant: WalletVariant.WalletConnect, sub, address, chainId },
            { upsert: true },
        );
    }
}
