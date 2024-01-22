import { TokenContractName } from '@thxnetwork/contracts/exports';
import { ChainId, TransactionState, TransactionType } from '@thxnetwork/types/enums';

export type TTransaction = {
    type: TransactionType;
    state: TransactionState;
    from: string;
    to: string;
    nonce: number;
    gas: string;
    chainId: ChainId;
    walletId: string;
    transactionId: string;
    transactionHash?: string;
    safeTxHash?: string;
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
};

export type TERC1155TokenMintCallbackArgs = {
    erc1155tokenId: string;
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

type ERC721TransferFromCallBack = {
    type: 'erc721nTransferFromCallback';
    args: TERC721TransferFromCallBackArgs;
};

export type TERC721TransferFromCallBackArgs = {
    erc721Id: string;
    erc721TokenId: string;
    sub: string;
};

// This is used for non pool transfers
type ERC721TransferFromWalletCallback = {
    type: 'erc721TransferFromWalletCallback';
    args: TERC721TransferFromWalletCallbackArgs;
};

export type TERC721TransferFromWalletCallbackArgs = {
    erc721Id: string;
    erc721TokenId: string;
    walletId: string;
    to: string;
};

// This is used for pool transfers
type ERC1155TransferFromCallback = {
    type: 'erc1155TransferFromCallback';
    args: TERC1155TransferFromCallbackArgs;
};

export type TERC1155TransferFromCallbackArgs = {
    erc1155Id: string;
    erc1155TokenId: string;
    sub: string;
};

// This is used for non pool transfers
type ERC1155TransferFromWalletCallback = {
    type: 'erc1155TransferFromWalletCallback';
    args: TERC1155TransferFromWalletCallbackArgs;
};

export type TERC1155TransferFromWalletCallbackArgs = {
    erc1155Id: string;
    erc1155TokenId: string;
    walletId: string;
    to: string;
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
    | ERC20TransferFromCallBack
    | ERC721TransferFromCallBack
    | ERC721TransferFromWalletCallback
    | ERC1155TransferFromCallback
    | ERC1155TransferFromWalletCallback;
