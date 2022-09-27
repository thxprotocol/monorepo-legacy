import store from '@thxprotocol/dashboard/store';
import { Route } from 'vue-router';

export function redirectPasswordResetLink(to: Route) {
    return store.dispatch('account/signinRedirect', {
        passwordResetToken: to.query.passwordResetToken || null,
    });
}

export function redirectConfirmationLink(to: Route) {
    return store.dispatch('account/signinRedirect', { signupToken: to.query.signup_token });
}

export function redirectSignin() {
    return store.dispatch('account/signinRedirect', {});
}

export function redirectSignout() {
    return store.dispatch('account/signoutRedirect', {});
}

export function redirectSignup() {
    return store.dispatch('account/signupRedirect', {});
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
