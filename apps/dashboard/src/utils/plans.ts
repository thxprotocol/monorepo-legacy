import { AccountPlanType } from '../types/account';

export const plans = [
    {
        type: AccountPlanType.Basic,
        name: 'Basic',
        text: '&euro;0/month',
    },
    {
        type: AccountPlanType.Premium,
        name: 'Premium',
        text: 'All features. &euro;*/month',
    },
];
