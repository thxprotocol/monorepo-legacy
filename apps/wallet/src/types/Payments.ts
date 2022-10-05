import { ChainId } from './enums/ChainId';

export enum PaymentState {
    Requested = 0,
    Pending = 1,
    Completed = 2,
    Failed = 3,
}

export interface IPayments {
    [id: string]: TPayment;
}

export type TPayment = {
    _id: string;
    amount: string;
    tokenSymbol: string;
    tokenAddress: string;
    poolId: string;
    chainId: ChainId;
    sender: string;
    receiver: string;
    transactions: string[];
    state: PaymentState;
    token: string;
    paymentUrl: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    createdAt: Date;
    updatedAt: Date;
};
