import store from '@thxnetwork/dashboard/store';
import {
    assertAuthorization,
    redirectAccount,
    redirectConfirmationLink,
    redirectPasswordResetLink,
    redirectPoolTransfer,
    redirectReferralCode,
    redirectSignin,
    redirectSigninSilent,
    redirectSignout,
    redirectSignup,
    redirectVerifyEmail,
} from '@thxnetwork/dashboard/utils/guards';
import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { track } from '../../../../libs/common/src/lib/mixpanel';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        name: 'home',
        path: '/',
        component: () => import('../views/Home.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'pools',
        path: '/pools',
        component: () => import('../views/Pools.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'pool',
        path: '/pool/:id',
        redirect: '/pool/:id/dashboard',
        component: () => import('../views/Pool.vue'),
        beforeEnter: assertAuthorization,
        children: [
            {
                name: 'dashboard',
                path: 'dashboard',
                component: () => import('../views/pool/Dashboard.vue'),
            },

            {
                name: 'conditional',
                path: 'conditional',
                component: () => import('../views/pool/Conditional.vue'),
            },
            {
                name: 'milestones',
                path: 'milestones',
                component: () => import('../views/pool/Milestones.vue'),
            },
            {
                name: 'daily',
                path: 'daily',
                component: () => import('../views/pool/Daily.vue'),
            },
            {
                name: 'referrals',
                path: 'referrals',
                component: () => import('../views/pool/Referrals.vue'),
            },
            {
                name: 'coin perks',
                path: 'erc20-perks',
                component: () => import('../views/pool/ERC20Perks.vue'),
            },
            {
                name: 'nft perks',
                path: 'erc721-perks',
                component: () => import('../views/pool/ERC721Perks.vue'),
            },
            {
                name: 'shopify perks',
                path: 'shopify-perks',
                component: () => import('../views/pool/ShopifyPerks.vue'),
            },
            {
                name: 'surveys',
                path: 'surveys',
                component: () => import('../views/pool/Surveys.vue'),
            },
            {
                name: 'Settings',
                path: 'settings',
                component: () => import('../views/pool/Settings.vue'),
                children: [
                    {
                        name: 'General',
                        path: 'general',
                        component: () => import('../views/pool/settings/General.vue'),
                    },
                    {
                        name: 'Discord',
                        path: 'discord',
                        component: () => import('../views/pool/settings/Discord.vue'),
                    },
                    {
                        name: 'Commerce',
                        path: 'commerce',
                        component: () => import('../views/pool/settings/Commerce.vue'),
                    },
                    {
                        name: 'Widget',
                        path: 'widget',
                        component: () => import('../views/pool/settings/Widget.vue'),
                    },
                    {
                        name: 'API',
                        path: 'api',
                        component: () => import('../views/pool/settings/API.vue'),
                    },
                ],
            },
        ],
    },
    {
        path: '/preview/:poolId',
        component: () => import('../views/Preview.vue'),
        // beforeEnter: assertAuthorization,
    },
    {
        name: 'coins',
        path: '/coins',
        component: () => import('../views/Coins.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'nft',
        path: '/nft',
        component: () => import('../views/NFT.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'metadata',
        path: '/nft/:erc721Id',
        redirect: '/nft/:erc721Id/metadata',
        component: () => import('../views/nft/NFT.vue'),
        beforeEnter: assertAuthorization,
        children: [
            {
                path: 'metadata',
                component: () => import('../views/nft/Metadata.vue'),
            },
        ],
    },
    {
        name: 'sign in redirect',
        path: '/signin-oidc',
        component: () => import('../views/SigninRedirect.vue'),
    },
    {
        name: 'verify email',
        path: '/verify_email',
        beforeEnter: redirectVerifyEmail,
    },
    {
        name: 'pool transfer',
        path: '/pools/:poolId/transfer/:token',
        beforeEnter: redirectPoolTransfer,
    },
    {
        name: 'reset password',
        path: '/reset',
        beforeEnter: redirectPasswordResetLink,
    },
    {
        name: 'account',
        path: '/account',
        beforeEnter: redirectAccount,
    },
    {
        name: 'sign up',
        path: '/signup',
        beforeEnter: redirectSignup,
    },

    {
        name: 'sign out',
        path: '/signout',
        beforeEnter: redirectSignout,
    },
    {
        name: 'confirm email',
        path: '/verify',
        beforeEnter: redirectConfirmationLink,
    },
    {
        name: 'sign in',
        path: '/signin',
        beforeEnter: redirectSignin,
    },
    {
        path: '/silent-renew',
        beforeEnter: redirectSigninSilent,
    },
];

const router = new VueRouter({
    mode: 'history',
    scrollBehavior: function (to) {
        if (to.hash) {
            return { selector: to.hash };
        } else {
            return { x: 0, y: 0 };
        }
    },
    routes,
});

router.beforeEach(async (to, from, next) => {
    if (to.query.referralCode) {
        await redirectReferralCode(to);
    }

    try {
        const user = await store.dispatch('account/getUser');
        if (user && to.name) track('UserVisits', [user.sub, to.name, to.params as unknown as string[]]);
        return next();
    } catch (err) {
        console.error(err);
    }
});

export default router;
