import { TokenContractName } from '@thxnetwork/contracts/exports';
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

export type TERC1155DeployCallbackArgs = {
    erc1155Id: string;
};

type WalletDeployCallback = {
    type: 'walletDeployCallback';
    args: TWalletDeployCallbackArgs;
};

export type TWalletDeployCallbackArgs = {
    walletId: string;
    owner: string;
    sub: string;
};

type ERC721DeployCallback = {
    type: 'Erc721DeployCallback';
    args: TERC721DeployCallbackArgs;
};

type ERC1155DeployCallback = {
    type: 'ERC1155DeployCallback';
    args: TERC1155DeployCallbackArgs;
};

export type TAssetPoolDeployCallbackArgs = {
    assetPoolId: string;
    chainId: number;
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

export type TERC1155TokenMintCallbackArgs = {
    erc1155tokenId: string;
    assetPoolId: string;
};

export type TERC1155TokenTransferCallbackArgs = {
    erc1155tokenId: string;
    assetPoolId: string;
};

type ERC721TokenMintCallback = {
    type: 'erc721TokenMintCallback';
    args: TERC721TokenMintCallbackArgs;
};

type ERC1155TokenMintCallback = {
    type: 'erc1155TokenMintCallback';
    args: TERC1155TokenMintCallbackArgs;
};

type ERC1155TokenTransferCallback = {
    type: 'erc1155TokenTransferCallback';
    args: TERC1155TokenTransferCallbackArgs;
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

export type TWalletGrantRoleCallBackArgs = {
    walletId: string;
};

type WalletGrantRoleCallBack = {
    type: 'grantRoleCallBack';
    args: TWalletGrantRoleCallBackArgs;
};

export type TWalletRevokeRoleCallBackArgs = {
    walletManagerId: string;
    walletId: string;
};

type WalletRevokeRoleCallBack = {
    type: 'revokeRoleCallBack';
    args: TWalletRevokeRoleCallBackArgs;
};

export type TERC20TransferFromCallBackArgs = {
    erc20Id: string;
};

type ERC20TransferFromCallBack = {
    type: 'transferFromCallBack';
    args: TERC20TransferFromCallBackArgs;
};

export type TTransactionCallback =
    | ERC20DeployCallback
    | ERC721DeployCallback
    | ERC1155DeployCallback
    | AssetPoolDeployCallback
    | TopupCallback
    | DepositCallback
    | SwapCreateCallback
    | ERC721TokenMintCallback
    | ERC1155TokenMintCallback
    | ERC1155TokenTransferCallback
    | PaymentCallback
    | WithdrawForCallback
    | WalletDeployCallback
    | WalletGrantRoleCallBack
    | WalletRevokeRoleCallBack
    | ERC20TransferFromCallBack;
