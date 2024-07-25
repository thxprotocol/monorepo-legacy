import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { createClient, Session, Provider } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY, BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { AccountVariant, accountVariantProviderKindMap, OAuthScopes } from '@thxnetwork/common/enums';
import { popup } from '@thxnetwork/dashboard/utils/popup';
import store from '@thxnetwork/dashboard/store';

export type TSession = Session;
export type TProvider = Provider;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

const supabaseAuthEventMap = {
    SIGNED_IN: async (session: Session) => {
        await store.dispatch('auth/onSignedIn', session);
        if (session) await store.dispatch('account/get');
    },
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
    }

    @Action({ rawError: true })
    async onSignedOut() {
        this.context.commit('setSession', null);
        this.context.commit('account/setAccount', null, { root: true });
    }
    @Action({ rawError: true })
    async connect({ kind, scopes }: { kind: string; scopes: string[] }) {
        const config = await this.context.dispatch('getOAuthConfig', {
            provider: kind,
            options: {
                scopes,
                skipBrowserRedirect: true,
                redirectTo: BASE_URL + '/auth/redirect',
            },
        });
        const { data, error } = await supabase.auth.linkIdentity(config);
        if (error) throw error;
        popup.open(data.url);
    }

    @Action({ rawError: true })
    async disconnect(kind: Provider) {
        const { data, error } = await supabase.auth.getUserIdentities();
        if (error) throw error;

        const identity = data.identities.find((i) => i.provider === kind);
        if (!identity) throw new Error('Identity not found');

        await supabase.auth.unlinkIdentity(identity);
        await supabase.auth.getUserIdentities();
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
        };
    }) {
        return {
            provider,
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                ...options,
                scopes: options.scopes.join(' '),
            },
        };
    }
}
