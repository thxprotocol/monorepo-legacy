<template>
    <div class="d-flex center-center h-100" v-if="!profile">
        <b-spinner variant="primary"></b-spinner>
    </div>
</template>

<script lang="ts">
import { track } from '@thxnetwork/mixpanel';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPools } from '../store/modules/pools';
import { IAccount } from '../types/account';
import { BASE_URL, NODE_ENV } from '@thxnetwork/dashboard/utils/secrets';
import { ChainId } from '@thxnetwork/sdk/types/enums/ChainId';
import { AccessTokenKind } from '@thxnetwork/types/enums';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class Redirect extends Vue {
    pools!: IPools;
    profile!: IAccount;

    async mounted() {
        const stateString = localStorage.getItem(`oidc.${this.$route.query.state}`) as string;
        const { data } = JSON.parse(stateString);

        await this.$store.dispatch('account/signinRedirectCallback');
        await this.$store.dispatch('account/getProfile');

        track('UserSignsIn', [this.profile]);

        // List pools to see if we need to deploy a first
        await this.$store.dispatch('pools/list');
        const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
        if (!Object.values(this.pools).length) this.$store.dispatch('pools/create', { chainId });

        // Detect if we should connect a shopify store
        if (data && data.shopify_params) {
            await this.$store.dispatch('account/signin', {
                prompt: 'connect',
                extraQueryParams: {
                    shopify_params: JSON.stringify(data.shopify_params),
                    return_url: BASE_URL,
                    access_token_kind: AccessTokenKind.Shopify,
                },
            });
        } else {
            this.$router.push('/');
        }
    }
}
</script>
