import store from '@thxnetwork/dashboard/store';
import { Route } from 'vue-router';

export function redirectPasswordResetLink(to: Route) {
    return store.dispatch('account/signinRedirect', {
        passwordResetToken: to.query.passwordResetToken || null,
    });
}

export function redirectConfirmationLink(to: Route) {
    return store.dispatch('account/signinRedirect', {
        signupToken: to.query.signup_token,
    });
}

export function redirectSignin() {
    return store.dispatch('account/signinRedirect', {});
}

export function redirectSignout() {
    return store.dispatch('account/signoutRedirect', {});
}

export async function redirectReferralCode(to: Route) {
    const user = await store.dispatch('account/getUser');
    return await store.dispatch(user ? 'account/update' : 'account/signinRedirect', {
        referralCode: to.query.referralCode,
    });
}

export async function redirectShopifyCode(to: Route) {
    const params = {
        hmac: to.query.hmac,
        host: to.query.host,
        shop: to.query.shop,
        state: to.query.state,
        timestamp: to.query.timestamp,
    };
    return await store.dispatch('account/signin', {
        state: {
            shopify_params: params,
        },
        extraQueryParams: {
            shopify_params: JSON.stringify(params),
        },
    });
}

export function redirectPoolTransfer(to: Route) {
    return store.dispatch('account/signinRedirect', { poolId: to.params.poolId, poolTransferToken: to.params.token });
}

export function redirectSignup(to: Route) {
    return store.dispatch('account/signinRedirect', {
        signupEmail: to.query.signup_email,
        signupPlan: to.query.signup_plan,
        signupOffer: to.query.signup_offer,
        referralCode: to.query.referralCode,
    });
}

export function redirectAccount(to: Route, from: Route) {
    return store.dispatch('account/accountRedirect', from.path);
}

export function redirectSigninSilent() {
    return store.dispatch('account/signinSilent');
}

export async function assertAuthorization(to: Route, from: Route, next: any) {
    const user = await store.dispatch('account/getUser');
    if (!user) return redirectSignin();
    next();
}

export function redirectVerifyEmail(to: Route) {
    return store.dispatch('account/signinRedirect', {
        verifyEmailToken: to.query.verifyEmailToken || null,
    });
}
