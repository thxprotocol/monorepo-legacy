import { Wallet, ethers } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import {
    POLYGON_RELAYER_API_KEY,
    POLYGON_RELAYER_API_SECRET,
    POLYGON_RPC,
    PRIVATE_KEY,
} from '@thxnetwork/api/config/secrets';
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import Safe, { SafeAccountConfig, EthersAdapter, SafeFactory } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { SafeTransaction, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { toChecksumAddress, toWei } from 'web3-utils';
import { Relayer } from 'defender-relay-client';
import Web3 from 'web3';

// @dev SSL node does not work here
const HARDHAT_RPC = 'http://localhost:8545';

// Defender Relay
const credentials = { apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET };
const defenderRelayProvider = new DefenderRelayProvider(credentials);

// Providers
const hardhatProvider = new (ethers as any).providers.JsonRpcProvider(HARDHAT_RPC);
const polygonProvider = new (ethers as any).providers.JsonRpcProvider(POLYGON_RPC);

// Signers
const relayerSigner = new DefenderRelaySigner(credentials, defenderRelayProvider, { speed: 'fast' });
const ownerSigner = new Wallet(PRIVATE_KEY, hardhatProvider) as unknown as Signer;
const userSigner = new Wallet(
    '0x97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9',
    hardhatProvider,
) as unknown as Signer;

// Safe Contracts
const SimulateTxAccessorAddress = '0xFF1eE64b8806C0891e8F73b37f8403F441b552E1';
const GnosisSafeProxyFactoryAddress = '0x1122fD9eBB2a8E7c181Cc77705d2B4cA5D72988A';
const DefaultCallbackHandlerAddress = '0x432422a750B7341c2c0d326fCE7A41cb3D75D3c8';
const CompatibilityFallbackHandlerAddress = '0x5D3D550Da6678C0444F5D77Ca086678D9CdeEecA';
const CreateCallAddress = '0x40Efd8a16485213445E6d8b9a4266Fd2dFf7C69a';
const MultiSendAddress = '0x7E4728eFfC9376CC7C0EfBCc779cC9833D83a984';
const MultiSendCallOnlyAddress = '0x75Cbb6C4Db4Bb4f6F8D5F56072A6cF4Bf4C5413C';
const SignMessageLibAddress = '0x658FAD2acB6d1E615f295E566ee9a6d32Cc97b10';
const GnosisSafeL2Address = '0xC44951780f195Ed71145e3d0d2F25726A097C348';
const GnosisSafeAddress = '0x45008E95F951AB2109227aeD1B2B2488e60c0615';

const contractNetworks = {
    '31337': {
        safeMasterCopyAddress: GnosisSafeL2Address,
        safeProxyFactoryAddress: GnosisSafeProxyFactoryAddress,
        multiSendAddress: MultiSendAddress,
        multiSendCallOnlyAddress: MultiSendCallOnlyAddress,
        fallbackHandlerAddress: CompatibilityFallbackHandlerAddress,
        signMessageLibAddress: SignMessageLibAddress,
        createCallAddress: CreateCallAddress,
    },
};

// Initialize signers
const ethAdapterRelayer = new EthersAdapter({ ethers, signerOrProvider: ownerSigner });
const hardhatServiceUrl = 'http://localhost:8000/txs';
const polygonServiceUrl = 'https://safe-transaction-polygon.safe.global';

const safeService = new SafeApiKit({ txServiceUrl: hardhatServiceUrl, ethAdapter: ethAdapterRelayer as any });

async function deploySafe(safeFactory: SafeFactory, relayerAddress: string, userWalletAddress: string) {
    const safeAccountConfig: SafeAccountConfig = {
        owners: [toChecksumAddress(userWalletAddress), toChecksumAddress(relayerAddress)],
        threshold: 2,
    };
    return await safeFactory.deploySafe({
        safeAccountConfig,
        options: { gasLimit: '30000000', nonce: await ownerSigner.getTransactionCount() },
    });
}

// API
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
