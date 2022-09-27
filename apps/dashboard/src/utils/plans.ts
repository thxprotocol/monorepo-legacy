import { AccountPlanType } from '../types/account';

export const plans = [
    {
        type: AccountPlanType.Free,
        name: 'Free',
        text: 'No-cost. &euro;0/month',
    },
    {
        type: AccountPlanType.Basic,
        name: 'Basic',
        text: 'Individuals. &euro;89/month',
    },
    {
        type: AccountPlanType.Premium,
        name: 'Premium',
        text: 'All features. &euro;*/month',
    },
];
