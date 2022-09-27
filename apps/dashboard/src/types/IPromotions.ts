import { TPromotion } from '@thxprotocol/dashboard/store/modules/promotions';

export interface IPromotions {
    [poolAddress: string]: { [id: string]: TPromotion };
}
