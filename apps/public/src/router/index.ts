import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { track } from '../utils/mixpanel';

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
        path: '/use-cases/next-generation-growth-hack-for-web3-companies',
        name: 'Next Generation Growth Hack for Web3 companies',
        component: () =>
            import(
                /* webpackChunkName: "usecases-nextgenerationgrowthhackforweb3companies" */ '../views/usecases/NextGenerationGrowthHackForWeb3Companies.vue'
            ),
    },
    {
        path: '/use-cases/boost-your-sales-and-turn-customers-into-community-members',
        name: 'Boost your sales and turn cusotmers into community members',
        component: () =>
            import(
                /* webpackChunkName: "usecases-boostyoursales" */ '../views/usecases/BoostYourSalesAndTurnCustomersIntoCommunityMembers.vue'
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

router.beforeEach(async (to, from, next) => {
    try {
        if (to.name) track.UserVisits('', to.name, to.params as unknown as string[]);
        return next();
    } catch (err) {
        console.error(err);
    }
});

export default router;
