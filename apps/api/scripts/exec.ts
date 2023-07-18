import { Wallet, ethers } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import {
    POLYGON_RELAYER_API_KEY,
    POLYGON_RELAYER_API_SECRET,
    POLYGON_RPC,
    PRIVATE_KEY,
} from '@thxnetwork/api/config/secrets';
import Web3 from 'web3';
import Safe, { SafeAccountConfig, EthersAdapter, SafeFactory } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { SafeTransaction, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { toChecksumAddress, toWei } from 'web3-utils';
import { Relayer } from 'defender-relay-client';
import { contractNetworks } from '@thxnetwork/api/config/contracts';

// @dev SSL node does not work here
const HARDHAT_RPC = 'http://localhost:8545';
const SAFE_TXS_URL = 'http://localhost:8000/txs';
// const SAFE_TXS_URL = 'https://safe-transaction-polygon.safe.global';

// Defender Relay
const credentials = { apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET };
const defenderRelayProvider = new DefenderRelayProvider(credentials);

// Providers
const hardhatProvider = new (ethers as any).providers.JsonRpcProvider(HARDHAT_RPC);
const polygonProvider = new (ethers as any).providers.JsonRpcProvider(POLYGON_RPC);

// Signers
const ownerSigner = new Wallet(PRIVATE_KEY, hardhatProvider) as unknown as Signer;
const relayerSigner = new DefenderRelaySigner(credentials, defenderRelayProvider, { speed: 'fast' });

// Mock user
const userSigner = new Wallet(
    '0x97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9',
    hardhatProvider,
) as unknown as Signer;

// Init
const ethAdapterRelayer = new EthersAdapter({ ethers, signerOrProvider: ownerSigner });
// const ethAdapterRelayer = new EthersAdapter({ ethers, signerOrProvider: relayerSigner });
const safeService = new SafeApiKit({ txServiceUrl: SAFE_TXS_URL, ethAdapter: ethAdapterRelayer as any });

async function deploySafe(safeFactory: SafeFactory, relayerAddress: string, userWalletAddress: string) {
    const safeAccountConfig: SafeAccountConfig = {
        owners: [toChecksumAddress(userWalletAddress), toChecksumAddress(relayerAddress)],
        threshold: 2,
    };
    return await safeFactory.deploySafe({
        safeAccountConfig,
        options: { gasLimit: '30000000' },
    });
}

async function createTransaction(safeAddress: string, to: string, amountInWei: string) {
    const safeSdk = await Safe.create({ ethAdapter: ethAdapterRelayer as any, safeAddress, contractNetworks });
    const safeTransactionData: SafeTransactionDataPartial = {
        to,
        data: '0x',
        value: amountInWei,
        safeTxGas: 5000000,
    };

    return await safeSdk.createTransaction({ safeTransactionData });
}

async function proposeTransaction(safeAddress: string, safeTransaction: SafeTransaction) {
    const safeSdk = await Safe.create({ ethAdapter: ethAdapterRelayer as any, safeAddress, contractNetworks });
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

    await safeService.proposeTransaction({
        safeAddress,
        safeTxHash,
        safeTransactionData: safeTransaction.data as any,
        senderAddress: toChecksumAddress(await ownerSigner.getAddress()),
        senderSignature: senderSignature.data,
    });
}

async function getLastPendingTransactions(safeAddress: string) {
    const { results } = await safeService.getPendingTransactions(toChecksumAddress(safeAddress));
    return results;
}

async function confirmTransaction(safeAddress: string, signer: Signer, safeTxHash: string) {
    const ethAdapterOwner = new EthersAdapter({ ethers, signerOrProvider: signer });
    const safeSdkOwner = await Safe.create({ ethAdapter: ethAdapterOwner as any, safeAddress, contractNetworks });
    const signature = await safeSdkOwner.signTransactionHash(safeTxHash);

    return await safeService.confirmTransaction(safeTxHash, signature.data);
}

async function executeTransactionSafe(safeAddress: string, safeTxHash: string) {
    const safeSdk = await Safe.create({ ethAdapter: ethAdapterRelayer as any, safeAddress, contractNetworks });
    const safeTransaction = await safeService.getTransaction(safeTxHash);
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction as any, {
        from: await ownerSigner.getAddress(),
    });

    return await executeTxResponse.transactionResponse?.wait();
}

async function executeTransactionRelayer(to: string, data: string, gas: number) {
    const args = {
        to,
        data,
        gasLimit: gas || '196000',
        speed: 'fast',
    };
    const relayer = new Relayer({ apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET });
    return await relayer.sendTransaction(args);
}

async function executeTransactionOwner(to: string, data: string, gas: number) {
    const web3 = new Web3(HARDHAT_RPC);
    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    return await web3.eth.sendTransaction({
        from: account.address,
        to,
        data,
        gas: String(gas),
    });
}

async function main() {
    const safeFactory = await SafeFactory.create({
        safeVersion: '1.3.0',
        contractNetworks,
        ethAdapter: ethAdapterRelayer as any,
    });
    const relayerAddress = await ownerSigner.getAddress();
    const userAddress = await userSigner.getAddress();
    const safeSdkOwner = await deploySafe(safeFactory, relayerAddress, userAddress);
    const safeAddress = toChecksumAddress(await safeSdkOwner.getAddress());
    console.log('Your Safe has been deployed:');
    console.log(`https://polygonscan.com/address/${safeAddress}`);
    console.log(`https://app.safe.global/matic:${safeAddress}`);

    // API;
    const safeTransaction = await createTransaction(
        safeAddress,
        toChecksumAddress('0xDe17Be1F562ce4809AcA9D655Db8Dca98E1B3442'),
        toWei('0.01', 'ether'),
    );
    console.log('[API] Created TX', safeTransaction);

    await proposeTransaction(safeAddress, safeTransaction);
    console.log('[API] Proposed TX');

    // Client
    const [pendingSafeTransaction] = await getLastPendingTransactions(safeAddress);
    console.log('[CLIENT] Pending TX', pendingSafeTransaction.safeTxHash);

    const confirmedTransaction = await confirmTransaction(
        safeAddress,
        userSigner as Signer,
        pendingSafeTransaction.safeTxHash,
    );
    console.log('[CLIENT] Confirmed TX', confirmedTransaction);

    // API
    const [pendingConfirmedSafeTransaction] = await getLastPendingTransactions(safeAddress);
    const { safeTxHash } = pendingConfirmedSafeTransaction;
    console.log('[API] Pending TX', safeTxHash);

    // Execute using hardhat owner
    const receipt = await executeTransactionOwner(
        safeAddress,
        pendingConfirmedSafeTransaction.data,
        pendingConfirmedSafeTransaction.safeTxGas,
    );
    console.log('[Relayer] Executed TX', receipt.transactionHash);

    // Execute using Polygon relayer
    // const receipt = await executeTransactionRelayer(
    //     safeAddress,
    //     pendingConfirmedSafeTransaction.data,
    //     pendingConfirmedSafeTransaction.safeTxGas,
    // );
    // console.log(`https://polygonscan.com/tx/${defenderTx.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
