import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { createClient, Session, Provider } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY, BASE_URL, API_URL } from '@thxnetwork/dashboard/config/secrets';
import {
    AccessTokenKind,
    AccountVariant,
    accountVariantProviderKindMap,
    OAuthScope,
    OAuthScopes,
} from '@thxnetwork/common/enums';
import { popup } from '@thxnetwork/dashboard/utils/popup';
import store from '@thxnetwork/dashboard/store';
import axios from 'axios';
import router from '../../router';
import { logger } from 'ethers';

export type TSession = Session;
export type TProvider = Provider;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

const supabaseAuthEventMap = {
    SIGNED_IN: async (session: Session) => store.dispatch('auth/onSignedIn', session),
    SIGNED_OUT: (session: Session) => store.dispatch('auth/onSignedOut', session),
};

supabase.auth.onAuthStateChange(async (event, session) => {
    const fn = supabaseAuthEventMap[event];
    if (fn) await fn(session);
    store.commit('auth/setIsReady', true);
});

@Module({ namespaced: true })
export default class AuthModule extends VuexModule {
    isReady = false;
    session = null as Session | null;

    get identities() {
        if (!this.session) return [];
        return this.session.user.identities;
    }

    get isAuthenticated() {
        return this.session && this.session.expires_in > 0;
    }

    @Mutation
    setSession(session: Session | null) {
        this.session = session;
    }

    @Mutation
    setIsReady(isReady: boolean) {
        this.isReady = isReady;
    }

    @Action({ rawError: true })
    async onSignedIn(session: Session | null) {
        const isExpired = session?.expires_at ? new Date(session.expires_at * 1000) < new Date() : false;
        if (!session || isExpired) return;
        this.context.commit('setSession', session);
        await store.dispatch('account/get');

        // On login page we redirect to redirect url or dashboard if an account is found
        const route = router.currentRoute;
        if (route.name === 'login') {
            if (route.query.redirect) {
                router.push({ path: route.query.redirect as string });
            } else if (route.query.collaboratorRequestToken) {
                const { poolId, collaboratorRequestToken } = route.query;
                await this.context.dispatch(
                    'pools/updateCollaborator',
                    { poolId, uuid: collaboratorRequestToken },
                    { root: true },
                );
            } else {
                router.push({ name: 'home' });
            }
        }
    }

    @Action({ rawError: true })
    async onSignedOut() {
        this.context.commit('setSession', null);
        this.context.commit('account/setAccount', null, { root: true });
    }

    @Action({ rawError: true })
    async connect({ kind, scopes }: { kind: AccessTokenKind; scopes: OAuthScope[] }) {
        const url = new URL(API_URL);
        url.pathname = '/v1/oauth/authorize/' + kind;
        url.searchParams.append('scopes', scopes.map((scope) => encodeURIComponent(scope)).join(','));
        url.searchParams.append('returnTo', BASE_URL + '/auth/redirect');

        try {
            const { data } = await axios({ method: 'GET', url: url.toString() });
            if (!data.url) throw new Error('Could not get authorize URL');
            popup.open(data.url);

            await this.context.dispatch('account/waitForToken', { kind, scopes }, { root: true });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    @Action({ rawError: true })
    async disconnect(kind: AccessTokenKind) {
        try {
            const url = new URL(API_URL);
            url.pathname = '/v1/account/disconnect/' + kind;
            await axios({ method: 'DELETE', url: url.toString() });

            await this.context.dispatch('account/waitForToken', { kind, scope: [] }, { root: true });
        } catch (error) {
            console.error(error);
        }
    }

    @Action({ rawError: true })
    async signInWithOtp({ email }: { email: string }) {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true, // We create users in supabase if they don't exist
                data: {
                    variant: AccountVariant.EmailPassword,
                },
            },
        });
        if (error) throw new Error(error.message);
    }

    @Action({ rawError: true })
    async verifyOtp({ email, token }: { email: string; token: string }) {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });
        if (error) throw new Error(error.message);
        await this.context.dispatch('account/waitForAccount', null, { root: true });
    }

    @Action({ rawError: true })
    async signinWithOAuth({ variant }: { variant: AccountVariant }) {
        const provider = accountVariantProviderKindMap[variant];
        if (!provider) throw new Error('Invalid provider');

        const config = await this.context.dispatch('getOAuthConfig', {
            provider,
            options: {
                scopes: OAuthScopes[provider],
                redirectTo: BASE_URL + '/auth/redirect',
                skipBrowserRedirect: true,
                data: { variant },
            },
        });
        const { data, error } = await supabase.auth.signInWithOAuth(config);
        if (error) throw new Error(error.message);
        popup.open(data.url);
        await this.context.dispatch('account/waitForAccount', null, { root: true });
    }

    @Action({ rawError: true })
    async signOut() {
        await supabase.auth.signOut();
    }

    @Action({ rawError: true })
    getOAuthConfig({
        provider,
        options,
    }: {
        provider: Provider;
        options: {
            scopes: string[];
            skipBrowserRedirect: boolean;
            redirectTo: string;
            data?: { variant: AccountVariant };
            queryParams?: { sub: string };
        };
    }) {
        return {
            provider,
            options: Object.assign(
                {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
                {
                    ...options,
                    scopes: options.scopes.join(' '),
                },
            ),
        };
    }
}
