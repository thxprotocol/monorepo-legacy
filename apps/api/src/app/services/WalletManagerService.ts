import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { WalletDocument } from '../models/Wallet';
import WalletManager from '../models/WalletManager';
import Wallet from '../models/Wallet';
import { assertEvent, parseLogs } from '../util/events';
import TransactionService from './TransactionService';
import { TransactionReceipt } from 'web3-core';
import { TWalletGrantRoleCallBackArgs } from '../types/TTransaction';
export default class WalletManagerService {
    public static MANAGER_ROLE = keccak256(toUtf8Bytes('MANAGER_ROLE'));

    static async setupManagerRoleAdmin(wallet: WalletDocument, adminAddress: string) {
        const tx = await TransactionService.sendAsync(
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
        console.log('tx', tx);
        return true;
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

    static async grantRoleCallBack({ walletId }: TWalletGrantRoleCallBackArgs, receipt: TransactionReceipt) {
        const wallet = await Wallet.findById(walletId);
        const events = parseLogs(wallet.contract.options.jsonInterface, receipt.logs);
        assertEvent('RoleGranted', events);
        console.log('Role Granted');
        return true;
    }

    static async findByWalletId(walletId: string) {
        return await WalletManager.find({ walletId });
    }
}
