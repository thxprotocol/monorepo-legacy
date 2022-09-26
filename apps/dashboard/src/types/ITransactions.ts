import { TTransaction } from '@thxprotocol/dashboard/store/modules/transactions';

export interface ITransactions {
    [poolAddress: string]: { [id: string]: TTransaction };
}
