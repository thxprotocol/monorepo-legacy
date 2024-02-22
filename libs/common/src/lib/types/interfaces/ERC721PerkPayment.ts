export type TERC721PerkPaymentIntent = {
    id: string;
    amount: string;
    currency: string;
};

export type TERC721PerkPayment = {
    sub: string;
    perkId: string;
    poolId: string;
    amount: number;
    paymentIntent: TERC721PerkPaymentIntent;
};
