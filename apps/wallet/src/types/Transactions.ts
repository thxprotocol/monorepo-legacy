import { ChainId } from './enums/ChainId';

export enum TransactionState {
    Scheduled = 0,
    Mined = 1,
    Failed = 2,
    Sent = 3,
}

export enum TransactionType {
    Default = 0,
    ITX = 1,
}

export type TTransaction = {
    _id: string;
    chainId: ChainId;
    to: string;
    type: TransactionType;
    state: TransactionState;
    failReason: string;
    createdAt: Date;
    updatedAt: Date;
    transactionHash: string;
    relayTransactionHash: string;
    maxPriorityFeePerGas: string;
};

export interface ITransactions {
    [id: string]: TTransaction;
}
