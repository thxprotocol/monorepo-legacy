import { TPayment } from '@thxprotocol/dashboard/store/modules/payments';

export interface IPayments {
    [poolId: string]: { [id: string]: TPayment };
}
