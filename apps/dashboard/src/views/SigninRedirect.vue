<template>
    <b-spinner variant="primary"></b-spinner>
</template>

<script lang="ts">
import { track } from '@thxnetwork/mixpanel';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPools } from '../store/modules/pools';
import { IAccount } from '../types/account';
import { NODE_ENV } from '@thxnetwork/dashboard/utils/secrets';
import { ChainId } from '@thxnetwork/sdk/types/enums/ChainId';

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
        await this.$store.dispatch('account/signinRedirectCallback');
        await this.$store.dispatch('account/getProfile');

        track('UserSignsIn', [this.profile]);

        // List pools to see if we need to deploy a first
        await this.$store.dispatch('pools/list');
        const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
        if (!Object.values(this.pools).length) this.$store.dispatch('pools/create', { chainId });

        this.$router.push('/');
    }
}
</script>
