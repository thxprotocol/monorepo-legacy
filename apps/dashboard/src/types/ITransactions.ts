import { TTransaction } from '@thxnetwork/dashboard/store/modules/transactions';

export interface ITransactions {
    [poolAddress: string]: { [id: string]: TTransaction };
}
