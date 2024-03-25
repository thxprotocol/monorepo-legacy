type TInvoice = {
    poolId: string;
    additionalUnitCount: number;
    costPerUnit: number;
    costSubscription: number;
    costTotal: number;
    currency: string;
    plan: AccountPlanType;
    periodStartDate: Date;
    periodEndDate: Date;
};
