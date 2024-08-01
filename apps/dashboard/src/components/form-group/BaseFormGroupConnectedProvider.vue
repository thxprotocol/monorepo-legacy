<template>
    <div class="d-flex justify-content-between align-items-center py-2">
        <div
            class="d-flex align-items-center justify-content-center py-2 bg-light mr-2 rounded"
            style="width: 40px; height: 40px"
        >
            <i :class="providerIconMap[provider.kind]" :style="{ color: provider.color, fontSize: '1rem' }"></i>
        </div>
        <div class="mr-auto">
            <strong>{{ provider.label }}</strong>
            <div v-if="token" class="small">
                <span class="text-opaque">{{ token.userId }}</span>
                <i v-b-tooltip class="fas fa-question-circle ml-1 text-opaque" :title="`${provider.label} User ID`" />
            </div>
        </div>
        <b-spinner v-if="isLoading" small />
        <template v-else>
            <b-button
                v-if="token"
                :disabled="isDisabled"
                variant="link"
                class="text-decoration-none text-primary"
                size="sm"
                @click="onClickDisconnect(provider)"
            >
                Disconnect
            </b-button>
            <b-button v-else :disabled="isLoading" variant="primary" size="sm" @click="onClickConnect(provider)">
                Connect
            </b-button>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { providerIconMap } from '@thxnetwork/common/maps';

@Component({
    computed: {
        ...mapGetters({
            account: 'account/profile',
        }),
    },
})
export default class App extends Vue {
    account!: TAccount;
    username = '';
    email = '';
    providerIconMap = providerIconMap;
    isLoading = false;

    @Prop() provider!: TProvider;

    get token() {
        return this.account.tokens.find((token) => token.kind === this.provider.kind);
    }

    get isDisabled() {
        if (!this.account || !this.token || this.isLoading) return true;
        return this.account.variant === this.token.kind;
    }

    mounted() {
        this.username = this.account.username || this.username;
        this.email = this.account.email || this.email;
    }

    async onClickConnect(provider: TProvider) {
        this.isLoading = true;
        try {
            await this.$store.dispatch('auth/connect', { kind: provider.kind, scopes: provider.scopes });
        } catch (error) {
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    async onClickDisconnect(provider: TProvider) {
        this.isLoading = true;
        try {
            await this.$store.dispatch('auth/disconnect', provider.kind);
        } catch (error) {
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
