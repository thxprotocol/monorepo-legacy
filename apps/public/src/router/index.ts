import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        path: '/pricing',
        name: 'Pricing',
        component: () => import(/* webpackChunkName: "pricing" */ '../views/Pricing.vue'),
    },
    {
        path: '/use-cases',
        name: 'Use Cases',
        component: () => import(/* webpackChunkName: "usecases" */ '../views/UseCases.vue'),
    },
    {
        path: '/events/play-in-business',
        name: 'Play in Business',
        component: () => import(/* webpackChunkName: "events-playinbusiness" */ '../views/events/PlayInBusiness.vue'),
    },
    {
        path: '/use-cases/onboard-new-players-with-referrals',
        name: 'Onboard new players with referrals',
        component: () =>
            import(
                /* webpackChunkName: "usecases-boostengagementinyourcommunity" */ '../views/usecases/OnboardNewPlayersWithReferrals.vue'
            ),
    },
    {
        path: '/use-cases/reward-your-loyal-customers',
        name: 'Reward your loyal customers',
        component: () =>
            import(
                /* webpackChunkName: "usecases-rewardyourloyalcustomers" */ '../views/usecases/RewardYourLoyalCustomers.vue'
            ),
    },
    {
        path: '/use-cases/erc-20-token-pools-for-blockchain-projects',
        name: 'Boost engagement in your community',
        component: () =>
            import(
                /* webpackChunkName: "usecases-tokenpoolsforprojects" */ '../views/usecases/ERC20TokenPoolsForBlockchainProjects.vue'
            ),
    },
    {
        path: '/use-cases/money-management-for-groups-of-people',
        name: 'Money Management For Groups Of People',
        component: () =>
            import(
                /* webpackChunkName: "usecases-moneymanagement" */ '../views/usecases/MoneyManagementForGroupsOfPeople.vue'
            ),
    },
    {
        path: '/integrations',
        name: 'Integrations',
        component: () => import(/* webpackChunkName: "integrations" */ '../views/Integrations.vue'),
    },
    {
        path: '/contact',
        name: 'Contact',
        component: () => import(/* webpackChunkName: "contact" */ '../views/Contact.vue'),
    },
    {
        path: '/signup',
        component: () => import(/* webpackChunkName: "signup" */ '../views/Signup.vue'),
    },
    {
        path: '/token',
        name: 'Token',
        component: () => import(/* webpackChunkName: "token" */ '../views/Token.vue'),
    },
    {
        path: '/demo',
        name: 'Demo',
        component: () => import(/* webpackChunkName: "demo" */ '../views/Demo.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes,
    scrollBehavior() {
        return { x: 0, y: 0 };
    },
});

export default router;
