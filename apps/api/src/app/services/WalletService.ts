import { Wallet } from '@thxnetwork/api/models/Wallet';
import { TAccount, TWallet } from '@thxnetwork/common/lib/types';
import { TransactionState, WalletVariant } from '@thxnetwork/types/enums';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import { getChainId, safeVersion } from './ContractService';
import { v4 } from 'uuid';
import SafeService from './SafeService';
import { PointRewardClaim } from '../models/PointRewardClaim';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import { DailyRewardClaim } from '../models/DailyRewardClaims';
import { GitcoinQuestEntry } from '../models/GitcoinQuestEntry';
import { Web3QuestClaim } from '../models/Web3QuestClaim';
import { ERC20Token } from '../models/ERC20Token';
import { ERC721Token } from '../models/ERC721Token';
import { ERC1155Token } from '../models/ERC1155Token';
import { ERC20PerkPayment } from '../models/ERC20PerkPayment';
import { ERC721PerkPayment } from '../models/ERC721PerkPayment';
import { DiscordRoleRewardPayment } from '../models/DiscordRoleRewardPayment';
import { CustomRewardPayment } from '../models/CustomRewardPayment';
import { CouponRewardPayment } from '../models/CouponRewardPayment';
import { Participant } from '../models/Participant';
import { logger } from '../util/logger';

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

    static findById(id: string) {
        if (!id) return;
        return Wallet.findById(id);
    }

    static findByUUID({ uuid }: { uuid: string }) {
        return Wallet.findOne({ uuid, expiresAt: { $gt: new Date(Date.now()) } });
    }

    static findOne(query: Partial<TWallet>) {
        return Wallet.findOne(query);
    }

    static formatAddress(address: string) {
        return `${address.slice(0, 5)}...${address.slice(-3)}`;
    }

    static async connect({ uuid, address }: Partial<TWallet>) {
        // Search if a walllet with this address already exists
        const oldWallet = await Wallet.findOne({ address, version: { $exists: false } });
        const wallet = await Wallet.findOneAndUpdate(
            // This filter allows to take ownership of wallets owned by other subs as long as
            // the address can be verified.
            { uuid, variant: WalletVariant.WalletConnect },
            { uuid: null, address },
            { new: true },
        );

        // Check if old wallet is owned by the same sub
        if (oldWallet.sub !== wallet.sub) {
            await this.migrate(oldWallet, wallet);
        }

        return wallet;
    }

    static async migrate(oldWallet: TWallet, newWallet: TWallet) {
        // Find all assets tied for the old wallet
        const [daily, social, custom, web3, gitcoin, erc20, erc721, erc1155, coin, nft, discord, customreward, coupon] =
            await Promise.all(
                [
                    DailyRewardClaim,
                    PointRewardClaim,
                    MilestoneRewardClaim,
                    Web3QuestClaim,
                    GitcoinQuestEntry,
                    // Coins
                    ERC20Token,
                    // NFT
                    ERC721Token,
                    ERC1155Token,
                    // RewardPayments
                    ERC20PerkPayment,
                    ERC721PerkPayment,
                    DiscordRoleRewardPayment,
                    CustomRewardPayment,
                    CouponRewardPayment,
                ].map((Model: any) => Model.find({ sub: oldWallet.sub })),
            );

        const operations = [];

        //

        // There could be duplicate entries for the same quest and sub after this update
        // Iterate over the entries and check if the new sub already as an entry for this questId
        // We should skip

        // Update the point balances for the new sub on campaigns of the old sub
        const oldParticipants = await Participant.find({ sub: oldWallet.sub });

        logger.info(`Migrated ${oldWallet.sub} to ${newWallet.sub}`);
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
        const safeWallet = await SafeService.findOne({ sub });
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
