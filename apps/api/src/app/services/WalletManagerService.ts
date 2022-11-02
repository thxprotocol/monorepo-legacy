import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { WalletDocument } from '../models/Wallet';
import WalletManager, { WalletManagerDocument } from '../models/WalletManager';
import Wallet from '../models/Wallet';
import { assertEvent, parseLogs } from '../util/events';
import TransactionService from './TransactionService';
import { TransactionReceipt } from 'web3-core';
import { TWalletGrantRoleCallBackArgs, TWalletRevokeRoleCallBackArgs } from '../types/TTransaction';
export default class WalletManagerService {
    public static MANAGER_ROLE = keccak256(toUtf8Bytes('MANAGER_ROLE'));

    static async setupManagerRoleAdmin(wallet: WalletDocument, adminAddress: string) {
        return await TransactionService.sendAsync(
            wallet.contract.options.address,
            wallet.contract.methods.setupRole(this.MANAGER_ROLE, adminAddress),
            wallet.chainId,
            true,
            {
                type: 'grantRoleCallBack',
                args: {
                    walletId: String(wallet._id),
                },
            },
        );
    }

    static async create(wallet: WalletDocument, managerAddress: string) {
        const walletManager = await WalletManager.create({ walletId: String(wallet._id), address: managerAddress });

        await TransactionService.sendAsync(
            wallet.contract.options.address,
            wallet.contract.methods.grantRole(this.MANAGER_ROLE, managerAddress),
            wallet.chainId,
            true,
            {
                type: 'grantRoleCallBack',
                args: {
                    walletId: String(wallet._id),
                },
            },
        );

        return walletManager;
    }

    static async grantRoleCallBack(args: TWalletGrantRoleCallBackArgs, receipt: TransactionReceipt) {
        const wallet = await Wallet.findById(args.walletId);
        const events = parseLogs(wallet.contract.options.jsonInterface, receipt.logs);
        assertEvent('RoleGranted', events);
    }

    static async remove(walletManager: WalletManagerDocument) {
        const wallet = await Wallet.findById(walletManager.walletId);

        await TransactionService.sendAsync(
            wallet.contract.options.address,
            wallet.contract.methods.revokeRole(this.MANAGER_ROLE, walletManager.address),
            wallet.chainId,
            true,
            {
                type: 'revokeRoleCallBack',
                args: {
                    walletManagerId: String(walletManager._id),
                    walletId: String(wallet._id),
                },
            },
        );

        return walletManager;
    }

    static async revokeRoleCallBack(args: TWalletRevokeRoleCallBackArgs, receipt: TransactionReceipt) {
        const wallet = await Wallet.findById(args.walletId);
        const events = parseLogs(wallet.contract.options.jsonInterface, receipt.logs);
        assertEvent('RoleRevoked', events);
        await WalletManager.findByIdAndRemove(args.walletManagerId);
    }

    static async findByWalletId(walletId: string) {
        return await WalletManager.find({ walletId });
    }
}
