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
        redirect: '/coins',
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
        path: '/claim/:id',
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
        path: '/collect',
        component: () => import(/* webpackChunkName: "collect" */ '../views/Collect.vue'),
    },
    {
        path: '/signin-oidc',
        component: () => import(/* webpackChunkName: "signin-oidc" */ '../views/SigninRedirect.vue'),
    },
    {
        path: '/user-agent-warning',
        name: 'Warning',
        component: () => import(/* webpackChunkName: "user-agent-warning" */ '../views/UserAgentWarning.vue'),
    },
    {
        path: '/coins',
        name: 'Coins',
        component: () => import(/* webpackChunkName: "crypto" */ '../views/Coins.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/nft',
        name: 'NFT',
        component: () => import(/* webpackChunkName: "nft" */ '../views/NFT.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/payment/:id',
        component: () => import(/* webpackChunkName: "payment" */ '../views/Payment.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
