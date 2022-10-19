import type { TERC721Metadata } from '@thxnetwork/wallet/store/modules/erc721';
import { TMembership } from '@thxnetwork/wallet/store/modules/memberships';
import type { TPromotion } from '@thxnetwork/wallet/store/modules/promotions';
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

export interface TPayment {
    _id: string;
    id: string;
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
    metadataId?: string;
    metadata?: TERC721Metadata;
    promotion?: TPromotion;
    membership?: TMembership;
};
