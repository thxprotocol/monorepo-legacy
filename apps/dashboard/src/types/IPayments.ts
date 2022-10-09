import { TPayment } from '@thxnetwork/dashboard/store/modules/payments';

export interface IPayments {
  [poolId: string]: { [id: string]: TPayment };
}
