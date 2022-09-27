import { IPool } from '@thxnetwork/dashboard/store/modules/pools';

type RouteDefinition = { path: string; label: string; iconClasses: string; visible: boolean };

export const getRoutes = (pool: IPool) => {
    const routes: RouteDefinition[] = [
        {
            path: 'metadata',
            label: 'Metadata',
            iconClasses: 'fas fa-palette',
            visible: !!pool.erc721,
        },
        {
            path: 'rewards',
            label: 'Rewards',
            iconClasses: 'fas fa-award',
            visible: !!pool.erc20 || !!pool.erc721,
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
            path: 'widgets',
            label: 'Widgets',
            iconClasses: 'fas fa-code',
            visible: !!pool.erc20,
        },
        {
            path: 'members',
            label: 'Members',
            iconClasses: 'fas fa-user',
            visible: !!pool.erc20 || !!pool.erc721,
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
            label: 'Theme',
            iconClasses: 'fas fa-palette',
            visible: !!pool.erc20 || !!pool.erc721,
        },
        {
            path: 'clients',
            label: 'Authorization',
            iconClasses: 'fas fa-key',
            visible: !!pool.erc20 || !!pool.erc721,
        },
        {
            path: 'info',
            label: 'Information',
            iconClasses: 'fas fa-info-circle',
            visible: !!pool.erc20 || !!pool.erc721,
        },
    ];

    return routes.filter((r: RouteDefinition) => r.visible);
};
