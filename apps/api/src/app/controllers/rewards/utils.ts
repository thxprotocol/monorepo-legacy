export function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export function minusMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() - minutes * 60000);
}

export function formatDate(date: Date) {
    const yyyy = date.getFullYear();
    let mm: any = date.getMonth() + 1; // Months start at 0!
    let dd: any = date.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return yyyy + '-' + mm + '-' + dd;
}

export function getRewardConfiguration(slug: RewardSlug) {
    switch (slug) {
        case 'no-limit-and-claim-one-disabled': {
            return {
                title: 'No limit and claim one disabled',
                slug: 'no-limit-and-claim-one-disabled',
                withdrawAmount: 1,
                withdrawLimit: 0,
                withdrawDuration: 0,
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }
        case 'one-limit-and-claim-one-disabled': {
            return {
                title: '1 limit and claim one disabled',
                slug: 'one-limit-and-claim-one-disabled',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 1,
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }
        case 'withdraw-date-is-today': {
            return {
                title: 'Withdraw date is today',
                slug: 'withdraw-date-is-today',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                withdrawUnlockDate: formatDate(new Date()),
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }
        case 'withdraw-date-is-tomorrow': {
            return {
                title: 'Withdraw date is tomorrow',
                slug: 'withdraw-date-is-tomorrow',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                withdrawUnlockDate: formatDate(addMinutes(new Date(), 24 * 60)),
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }
        case 'expiration-date-is-next-30-min': {
            return {
                title: 'Expiration date is next 30 min',
                slug: 'expiration-date-is-next-30-min',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: false,
                isMembershipRequired: false,
                expiryDate: addMinutes(new Date(), 30),
                amount: 1,
            };
        }
        case 'expiration-date-is-previous-30-min': {
            return {
                title: 'Expiration date is previous 30 min',
                slug: 'expiration-date-is-previous-30-min',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: false,
                isMembershipRequired: false,
                expiryDate: minusMinutes(new Date(), 24 * 60),
                amount: 1,
            };
        }
        case 'membership-is-required': {
            return {
                title: 'Membership is required',
                slug: 'membership-is-required',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: false,
                isMembershipRequired: true,
                amount: 1,
            };
        }
        case 'claim-one-is-enabled': {
            return {
                title: 'Claim one is enabled',
                slug: 'claim-one-is-enabled',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: true,
                isMembershipRequired: false,
                amount: 1,
            };
        }
        case 'claim-one-is-enabled-and-amount-is-greather-than-1': {
            return {
                title: 'Claim one is enabled and amount is greather than 1',
                slug: 'claim-one-is-enabled-and-amount-is-greather-than-1',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: true,
                isMembershipRequired: false,
                amount: 10,
            };
        }
        case 'claim-one-is-disabled': {
            return {
                title: 'Claim one is disabled',
                slug: 'claim-one-is-disabled',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }
    }
}

type RewardSlug =
    | 'no-limit-and-claim-one-disabled'
    | 'one-limit-and-claim-one-disabled'
    | 'withdraw-date-is-tomorrow'
    | 'withdraw-date-is-today'
    | 'expiration-date-is-next-30-min'
    | 'expiration-date-is-previous-30-min'
    | 'membership-is-required'
    | 'claim-one-is-enabled'
    | 'claim-one-is-enabled-and-amount-is-greather-than-1'
    | 'claim-one-is-disabled';
