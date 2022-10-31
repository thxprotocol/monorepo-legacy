import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { getContractFromName } from '../config/contracts';
import { WalletDocument } from '../models/Wallet';
import WalletManager from '../models/WalletManager';
import { assertEvent, parseLogs } from '../util/events';
import TransactionService from './TransactionService';

export default class WalletManagerService {
    static async create(wallet: WalletDocument, managerAddress: string) {
        const receipt = await TransactionService.send(
            wallet.address,
            wallet.contract.methods.grantRole(keccak256(toUtf8Bytes('MANAGER_ROLE')), managerAddress),
            wallet.chainId,
        );

        assertEvent('RoleGranted', parseLogs(wallet.contract.options.jsonInterface, receipt.logs));

        const result = await WalletManager.create({ walletId: wallet._id, address: managerAddress });

        return result;
    }

    static async findByWalletId(walletId: string) {
        return await WalletManager.find({ walletId });
    }
}
