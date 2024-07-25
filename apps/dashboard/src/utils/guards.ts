import store from '@thxnetwork/dashboard/store';
import { Route } from 'vue-router';

export function redirectCollaborationRequest(to: Route) {
    return store.dispatch('account/signinRedirect', {
        collaboratorRequestToken: to.query.collaboratorRequestToken || null,
        poolId: to.query.poolId,
    });
}

export function redirectVerifyEmail(to: Route) {
    return store.dispatch('account/signinRedirect', {
        verifyEmailToken: to.query.verifyEmailToken || null,
    });
}

export function redirectSignout(to: Route) {
    return store.dispatch('auth/signOut');
}
