import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { getContractFromName } from '../config/contracts';
import { WalletDocument } from '../models/Wallet';
import WalletManager from '../models/WalletManager';
import { assertEvent, parseLogs } from '../util/events';
import TransactionService from './TransactionService';

export default class WalletManagerService {
    static async create(wallet: WalletDocument, managerAddress: string) {
        // const owner = await wallet.contract.methods.owner().call();
        // console.log('OWNER ------------------', owner);

        // const receipt = await TransactionService.send(
        //     wallet.address,
        //     wallet.contract.methods.grantRole(keccak256(toUtf8Bytes('MANAGER_ROLE')), managerAddress),
        //     wallet.chainId,
        // );
        // console.log('RECEIPT ------------------', receipt);
        // assertEvent('RoleGranted', parseLogs(wallet.contract.options.jsonInterface, receipt.logs));
        // console.log('event asserted OK ------------------');
        const result = await WalletManager.create({ walletId: wallet._id, address: managerAddress });
        // console.log('RESULT -----------', result);
        return result;
    }

    static async findByWalletId(walletId: string) {
        return await WalletManager.find({ walletId });
    }
}
