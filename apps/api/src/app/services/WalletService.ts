import { Wallet } from '@thxnetwork/api/models/Wallet';
import { TransactionState, WalletVariant } from '@thxnetwork/common/enums';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import { getChainId, safeVersion } from './ContractService';
import SafeService from './SafeService';

export default class WalletService {
    static async list(account: TAccount) {
        // List all wallets owned by the account but filter out wallets used for the campaign
        const wallets = await Wallet.find({
            sub: account.sub,
            variant: { $in: [WalletVariant.Safe, WalletVariant.WalletConnect] },
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

    static findById(id: string) {
        if (!id) return;
        return Wallet.findById(id);
    }

    static findOne(query: Partial<TWallet>) {
        return Wallet.findOne(query);
    }

    static formatAddress(address: string) {
        return `${address.slice(0, 5)}...${address.slice(-3)}`;
    }

    static create(variant: WalletVariant, data: Partial<TWallet>) {
        const chainId = getChainId();
        const map = {
            [WalletVariant.Safe]: WalletService.createSafe,
            [WalletVariant.WalletConnect]: WalletService.createWalletConnect,
        };
        return map[variant]({ ...(data as TWallet), chainId });
    }

    static async createSafe({ sub, address, chainId }) {
        const safeWallet = await SafeService.findOne({ sub });
        // An account can have max 1 Safe
        if (safeWallet) throw new Error('Already has a Safe.');

        // Deploy a Safe with Web3Auth address and relayer as signers
        await SafeService.create({ sub, chainId, safeVersion }, address);
    }

    static async createWalletConnect({ sub, address, chainId }) {
        const data: Partial<TWallet> = { variant: WalletVariant.WalletConnect, sub, address, chainId };

        await Wallet.findOneAndUpdate({ sub, address, chainId }, data, { upsert: true });
    }
}
