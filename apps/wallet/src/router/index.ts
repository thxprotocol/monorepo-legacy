import Vue from 'vue-demi';
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
    component: () =>
      import(/* webpackChunkName: "collect" */ '../views/Collect.vue'),
  },
  {
    path: '/signin-oidc',
    component: () =>
      import(
        /* webpackChunkName: "signin-oidc" */ '../views/SigninRedirect.vue'
      ),
  },
  {
    path: '/user-agent-warning',
    name: 'Warning',
    component: () =>
      import(
        /* webpackChunkName: "user-agent-warning" */ '../views/UserAgentWarning.vue'
      ),
  },
  {
    path: '/tokens',
    name: 'Tokens',
    component: () =>
      import(/* webpackChunkName: "crypto" */ '../views/Crypto.vue'),
    beforeEnter: assertAuthorization,
  },
  {
    path: '/collectibles',
    name: 'Collectibles',
    component: () => import(/* webpackChunkName: "nft" */ '../views/NFT.vue'),
    beforeEnter: assertAuthorization,
  },
  {
    path: '/payment/:id',
    component: () =>
      import(/* webpackChunkName: "payment" */ '../views/Payment.vue'),
  },
  {
    path: '/memberships',
    name: 'Memberships',
    component: () =>
      import(/* webpackChunkName: "memberships" */ '../views/Memberships.vue'),
    beforeEnter: assertAuthorization,
  },
  {
    path: '/memberships/:id',
    redirect: '/memberships/:id/withdrawals',
  },
  {
    path: '/memberships/:id/withdrawals',
    name: 'Withdrawals',
    component: () =>
      import(
        /* webpackChunkName: "memberships-withdrawals" */ '../views/memberships/Withdrawals.vue'
      ),
    beforeEnter: assertAuthorization,
  },
  {
    path: '/memberships/:id/promotions',
    name: 'Promotions',
    component: () =>
      import(
        /* webpackChunkName: "memberships-promotions" */ '../views/memberships/Promotions.vue'
      ),
    beforeEnter: assertAuthorization,
  },
  {
    path: '/memberships/:id/erc20swaprules',
    name: 'Swaps',
    component: () =>
      import(
        /* webpackChunkName: "memberships-swaprules" */ '../views/memberships/SwapRules.vue'
      ),
    beforeEnter: assertAuthorization,
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
