import { IPool } from '@thxnetwork/dashboard/store/modules/pools';

type RouteDefinition = {
    path: string;
    label: string;
    iconClasses: string;
    visible: boolean;
};

export const getRoutes = (pool: IPool) => {
    const routes: RouteDefinition[] = [
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
            visible: !!pool.erc20 || !!pool.erc721,
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
        {
            path: 'payments',
            label: 'Payments',
            iconClasses: 'fas fa-money-check-alt',
            visible: !!pool.erc20,
        },
        {
            path: 'promotions',
            label: 'Promotions',
            iconClasses: 'fas fa-tags',
            visible: !!pool.erc20,
        },
        {
            path: 'transactions',
            label: 'Analytics',
            iconClasses: 'fas fa-chart-line',
            visible: !!pool.erc20,
        },
        {
            path: 'erc20swaps',
            label: 'Swaps',
            iconClasses: 'fas fa-sync',
            visible: !!pool.erc20,
        },
        {
            path: 'theme',
            label: 'Settings',
            iconClasses: 'fas fa-cogs',
            visible: !!pool.erc20 || !!pool.erc721,
        },
        {
            path: 'clients',
            label: 'API Keys',
            iconClasses: 'fas fa-key',
            visible: !!pool.erc20 || !!pool.erc721,
        },
    ];

    return routes.filter((r: RouteDefinition) => r.visible);
};
