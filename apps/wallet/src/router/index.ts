import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import {
    assertAuthorization,
    assertUserAgent,
    redirectConfirmationLink,
    redirectPasswordResetLink,
    redirectSignin,
    redirectAccount,
    redirectSignout,
    redirectSignup,
} from '@thxnetwork/wallet/utils/guards';
import { track } from '../utils/mixpanel';
import { thxClient } from '../utils/oidc';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        name: 'home',
        path: '/',
        redirect: '/coins',
    },
    {
        name: 'reset password',
        path: '/reset',
        beforeEnter: redirectPasswordResetLink,
    },
    {
        name: 'verify email',
        path: '/verify',
        beforeEnter: redirectConfirmationLink,
    },
    {
        name: 'claim url',
        path: '/claim/:id',
        beforeEnter: assertUserAgent,
    },
    {
        name: 'sign in',
        path: '/signin',
        beforeEnter: redirectSignin,
    },
    {
        name: 'sign up',
        path: '/signup',
        beforeEnter: redirectSignup,
    },
    {
        name: 'account',
        path: '/account',
        beforeEnter: redirectAccount,
    },
    {
        name: 'sign out',
        path: '/signout',
        beforeEnter: redirectSignout,
    },
    {
        name: 'collect',
        path: '/collect',
        component: () => import(/* webpackChunkName: "collect" */ '../views/Collect.vue'),
    },
    {
        name: 'sign in redirect',
        path: '/signin-oidc',
        component: () => import(/* webpackChunkName: "signin-oidc" */ '../views/SigninRedirect.vue'),
    },
    {
        path: '/user-agent-warning',
        name: 'user agent warning',
        component: () => import(/* webpackChunkName: "user-agent-warning" */ '../views/UserAgentWarning.vue'),
    },
    {
        path: '/coins',
        name: 'coins',
        component: () => import(/* webpackChunkName: "crypto" */ '../views/Coins.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        path: '/nft',
        name: 'nft',
        component: () => import(/* webpackChunkName: "nft" */ '../views/NFT.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'payment url',
        path: '/payment/:id',
        component: () => import(/* webpackChunkName: "payment" */ '../views/Payment.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

router.beforeEach(async (to, from, next) => {
    try {
        const user = thxClient.session.user;
        if (user) track.UserVisits(user.profile.sub, to.name || 'unknown', to.params as unknown as string[]);
        return next();
    } catch (err) {
        console.error(err);
    }
});

export default router;
