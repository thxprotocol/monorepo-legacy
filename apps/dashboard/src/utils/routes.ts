import { IPool } from '@thxnetwork/dashboard/store/modules/pools';

export type RouteDefinition = {
    path: string;
    label: string;
    iconClasses: string;
    visible: boolean;
};

export const getRoutes = (pool: IPool, isPremium = false) => {
    if (!pool || (pool && !pool.address)) return;

    const routes: RouteDefinition[] = [
        {
            path: 'transactions',
            label: 'Dashboard',
            iconClasses: 'fas fa-chart-line',
            visible: true,
        },
        {
            path: 'widget',
            label: 'Widget',
            iconClasses: 'fas fa-code',
            visible: true,
        },
        {
            path: 'point-rewards',
            label: 'Points',
            iconClasses: 'fas fa-trophy',
            visible: true,
        },
        {
            path: 'referral-rewards',
            label: 'Referrals',
            iconClasses: 'fas fa-comments',
            visible: true,
        },
        {
            path: 'metadata',
            label: 'NFT Metadata',
            iconClasses: 'fas fa-palette',
            visible: !!pool.erc721,
        },
        {
            path: 'erc721-perks',
            label: 'NFT Perks',
            iconClasses: 'fas fa-award',
            visible: !!pool.erc721,
        },
        {
            path: 'erc20-perks',
            label: 'Currency Perks',
            iconClasses: 'fas fa-coins',
            visible: !!pool.erc20,
        },
        // {
        //     path: 'payments',
        //     label: 'Payments',
        //     iconClasses: 'fas fa-money-check-alt',
        //     visible: !!pool.erc20,
        // },
        // {
        //     path: 'promotions',
        //     label: 'Promotions',
        //     iconClasses: 'fas fa-tags',
        //     visible: !!pool.erc20,
        // },
        // {
        //     path: 'erc20swaps',
        //     label: 'Swaps',
        //     iconClasses: 'fas fa-sync',
        //     visible: !!pool.erc20,
        // },
        {
            path: 'theme',
            label: 'Settings',
            iconClasses: 'fas fa-cogs',
            visible: true,
        },
        {
            path: 'clients',
            label: 'API Keys',
            iconClasses: 'fas fa-key',
            visible: isPremium,
        },
        {
            path: 'info',
            label: 'Contracts',
            iconClasses: 'fas fa-project-diagram',
            visible: true,
        },
    ];

    return routes.filter((r: RouteDefinition) => r.visible);
};
