import { DepositState } from '@thxnetwork/api/types/enums/DepositState';

export type TDeposit = {
    id: string;
    sub: string;
    amount: string;
    sender: string;
    receiver: string;
    state: DepositState;
    transactions: string[];
    item?: string;
    failReason?: string;
    createdAt: Date;
    updatedAt?: Date;
};
