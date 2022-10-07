import { TokenContractName } from '@thxnetwork/artifacts';
import { ChainId, TransactionState, TransactionType } from './enums';

export type TTransaction = {
    type: TransactionType;
    state: TransactionState;
    from: string;
    to: string;
    nonce: number;
    gas: string;
    chainId: ChainId;
    transactionId: string;
    transactionHash?: string;
    call?: { fn: string; args: string };
    baseFee?: string;
    maxFeeForGas?: string;
    maxPriorityFeeForGas?: string;
    failReason?: string;
    callback: TTransactionCallback;
};

export type TERC20DeployCallbackArgs = {
    erc20Id: string;
};

type ERC20DeployCallback = {
    type: 'Erc20DeployCallback';
    args: TERC20DeployCallbackArgs;
};

export type TERC721DeployCallbackArgs = {
    erc721Id: string;
};

type ERC721DeployCallback = {
    type: 'Erc721DeployCallback';
    args: TERC721DeployCallbackArgs;
};

export type TAssetPoolDeployCallbackArgs = {
    assetPoolId: string;
    chainId: number;
    erc20Address: string;
    erc721Address: string;
};

type AssetPoolDeployCallback = {
    type: 'assetPoolDeployCallback';
    args: TAssetPoolDeployCallbackArgs;
};

export type TTopupCallbackArgs = {
    receiver: string;
    depositId: string;
};

type TopupCallback = {
    type: 'topupCallback';
    args: TTopupCallbackArgs;
};

export type TDepositCallbackArgs = {
    assetPoolId: string;
    depositId: string;
};

type DepositCallback = {
    type: 'depositCallback';
    args: TDepositCallbackArgs;
};

export type TSwapCreateCallbackArgs = {
    assetPoolId: string;
    swapId: string;
};

type SwapCreateCallback = {
    type: 'swapCreateCallback';
    args: TSwapCreateCallbackArgs;
};

export type TERC721TokenMintCallbackArgs = {
    erc721tokenId: string;
    assetPoolId: string;
};

type ERC721TokenMintCallback = {
    type: 'erc721TokenMintCallback';
    args: TERC721TokenMintCallbackArgs;
};

export type TPayCallbackArgs = {
    paymentId: string;
    contractName: TokenContractName;
    address: string;
};

type PaymentCallback = {
    type: 'paymentCallback';
    args: TPayCallbackArgs;
};

export type TWithdrawForCallbackArgs = {
    withdrawalId: string;
    assetPoolId: string;
};

type WithdrawForCallback = {
    type: 'withdrawForCallback';
    args: TWithdrawForCallbackArgs;
};

export type TTransactionCallback =
    | ERC20DeployCallback
    | ERC721DeployCallback
    | AssetPoolDeployCallback
    | TopupCallback
    | DepositCallback
    | SwapCreateCallback
    | ERC721TokenMintCallback
    | PaymentCallback
    | WithdrawForCallback;
