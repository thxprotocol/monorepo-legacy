import { Wallet } from '@thxnetwork/api/models/Wallet';
import { TAccount, TWallet } from '@thxnetwork/common/lib/types';
import { TransactionState, WalletVariant } from '@thxnetwork/types/enums';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import SafeService from './SafeService';
import { getChainId, safeVersion } from './ContractService';
import { v4 } from 'uuid';

export default class WalletService {
    static async list(account: TAccount) {
        // List all wallets owned by the account but filter out wallets used for the campaign
        const wallets = await Wallet.find({
            sub: account.sub,
            address: { $exists: true, $ne: null },
            poolId: { $exists: false },
        });

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

    static findOne({ uuid }: { uuid: string }) {
        return Wallet.findOne({ uuid, expiresAt: { $gt: new Date(Date.now()) } });
    }

    static formatAddress(address: string) {
        return `${address.slice(0, 5)}...${address.slice(-3)}`;
    }

    static connect({ uuid, address }: Partial<TWallet>) {
        return Wallet.findOneAndUpdate(
            { uuid, variant: WalletVariant.WalletConnect },
            { uuid: null, address },
            { new: true },
        );
    }

    static create(variant: WalletVariant, data: Partial<TWallet>) {
        const chainId = getChainId();
        const map = {
            [WalletVariant.Safe]: WalletService.createSafe,
            [WalletVariant.WalletConnect]: WalletService.createWalletConnect,
        };
        return map[variant]({ ...data, chainId });
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
        const data: Partial<TWallet> = { variant: WalletVariant.WalletConnect, sub, address, chainId };

        if (!address) {
            // Expires in 10 minutes
            data.expiresAt = new Date(Date.now() + 1000 * 60 * 10);
            data.uuid = v4();
        }

        // This filter allows to take ownership of wallets owned by other subs as long as
        // the address can be verified.
        await Wallet.findOneAndUpdate({ address, chainId }, data, { upsert: true });
    }
}
