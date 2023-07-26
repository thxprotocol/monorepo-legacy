import { VOTER_PK, DEPOSITOR_PK } from './constants';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/types/enums';
import { ethers } from 'ethers';
import { contractNetworks } from '@thxnetwork/api/config/contracts';
import { HARDHAT_RPC } from '@thxnetwork/api/config/secrets';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';

const { web3 } = getProvider(ChainId.Hardhat);

export const voter = web3.eth.accounts.privateKeyToAccount(VOTER_PK);
export const depositor = web3.eth.accounts.privateKeyToAccount(DEPOSITOR_PK);

export function createWallet(privateKey: string) {
    return web3.eth.accounts.privateKeyToAccount(privateKey);
}

export const timeTravel = async (seconds: number) => {
    web3.extend({
        methods: [
            {
                name: 'increaseTime',
                call: 'evm_increaseTime',
                params: 1,
            },
            {
                name: 'mine',
                call: 'evm_mine',
            },
        ],
    });
    await (web3 as any).increaseTime(seconds);
};

export async function signTxHash(safeAddress: string, safeTxHash: string, privateKey: string) {
    const provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const signer = new ethers.Wallet(privateKey, provider);
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer }) as any;
    const safe = await Safe.create({ ethAdapter, safeAddress, contractNetworks });
    const signature = await safe.signTransactionHash(safeTxHash);

    return { safeTxHash, signature: signature.data };
}
