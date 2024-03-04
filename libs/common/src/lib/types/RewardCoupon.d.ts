type TRewardCoupon = TReward & {
    codes: string[];
    couponCodes: TCouponCode[];
    webshopURL: string;
};

type TRewardCouponPayment = TBaseRewardPayment & {
    couponCodeId: string;
    code: string;
};

type TCouponCode = {
    _id: string;
    couponRewardId: string;
    poolId: string;
    code: string;
    sub: string;
    createdAt: Date;
};
