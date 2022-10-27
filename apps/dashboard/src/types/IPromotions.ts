import type { TPromotion } from '@thxnetwork/dashboard/store/modules/promotions';

export interface IPromotions {
  [poolAddress: string]: { [id: string]: TPromotion };
}
