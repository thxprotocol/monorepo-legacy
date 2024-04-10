import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '../models';
import TransactionService from './TransactionService';
import { getProvider } from '../util/network';
import { BigNumber } from 'ethers';

export default class PaymentService {
    static async deposit(safe: WalletDocument, amountInWei: BigNumber) {
        const addresses = contractNetworks[safe.chainId];
        const { web3 } = getProvider(safe.chainId);
        console.log(addresses.USDC);
        const contract = new web3.eth.Contract(contractArtifacts['USDC'].abi, addresses.USDC);
        console.log(safe.address, amountInWei.toString());
        const fn = contract.methods.deposit(safe.address, amountInWei.toString());

        // TODO Create payment in db

        return await TransactionService.sendSafeAsync(safe, addresses.PaymentSplitter, fn);
    }
}
