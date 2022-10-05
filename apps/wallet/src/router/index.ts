import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import {
    assertAuthorization,
    assertUserAgent,
    redirectConfirmationLink,
    redirectLoginLink,
    redirectPasswordResetLink,
    redirectSignin,
    redirectAccount,
    redirectSignout,
    redirectSignup,
} from '@thxnetwork/wallet/utils/guards';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        redirect: '/memberships',
    },
    {
        path: '/reset',
        beforeEnter: redirectPasswordResetLink,
    },
    {
        path: '/verify',
        beforeEnter: redirectConfirmationLink,
    },
    {
        path: '/login',
        beforeEnter: redirectLoginLink,
    },
    {
        path: '/claim',
        beforeEnter: assertUserAgent,
    },
    {
        path: '/signin',
        beforeEnter: redirectSignin,
    },
    {
        path: '/signup',
        beforeEnter: redirectSignup,
    },
    {
        path: '/account',
        beforeEnter: redirectAccount,
    },
    {
        path: '/signout',
        beforeEnter: redirectSignout,
    },
    {
        path: '/signin-oidc',
        component: () => import('../views/SigninRedirect.vue'),
    },
    {
        path: '/user-agent-warning',
        name: 'Warning',
        component: () => import('../views/UserAgentWarning.vue'),
    },
    {
        path: '/wallet',
        name: 'Wallet',
        component: () => import('../views/Wallet.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/payment/:id',
        component: () => import('../views/Payment.vue'),
    },
    {
        path: '/memberships',
        name: 'Pools',
        component: () => import('../views/Memberships.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/memberships/:id',
        redirect: '/memberships/:id/withdrawals',
    },
    {
        path: '/memberships/:id/withdrawals',
        name: 'Withdrawals',
        component: () => import('../views/memberships/Withdrawals.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/memberships/:id/promotions',
        name: 'Promotions',
        component: () => import('../views/memberships/Promotions.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/memberships/:id/erc20swaprules',
        name: 'Swaps',
        component: () => import('../views/memberships/SwapRules.vue'),
        beforeEnter: assertAuthorization,
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
