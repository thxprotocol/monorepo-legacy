import { WithdrawalState } from '@thxnetwork/api/types/enums';

export type TWithdrawal = {
    state: WithdrawalState;
    erc20Id: string;
    sub: string;
    transactions: string[];
    amount: number;
    failReason?: string;
    createdAt: Date;
    updatedAt?: Date;
};
