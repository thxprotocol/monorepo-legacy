import { MerchantFeeVariant } from '@thxnetwork/types/index';
import { STRIPE_SECRET_KEY } from '../config/secrets';
import Stripe from 'stripe';

const PLATFORM_FEE = 0.025;

export const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: null });

const feeVariants = {
    EU_STANDARD: { Percent: 0.014, Fixed: 0.25 }, // APRIL 10:  { Percent: “0.015”, Fixed: “0.25” },
    EU_PREMIUM: { Percent: 0.014, Fixed: 0.25 }, // APRIL 10:  { Percent: “0.019”, Fixed: “0.25” },
    UK: { Percent: 0.025, Fixed: 0.25 }, // { APRIL 10: Percent: “0.025”, Fixed: “0.25” }
    INTERNATIONAL: { Percent: 0.029, Fixed: 0.25 }, // APRIL 10: { Percent: “0.0325”, Fixed: “0.25” }
};

export function getFeeForCardCountry(variant: MerchantFeeVariant, amount: number) {
    const fee = feeVariants[variant];
    const stripeFee = amount * fee.Percent + fee.Fixed;
    const platformFee = amount * PLATFORM_FEE;

    return stripeFee + platformFee;
}
