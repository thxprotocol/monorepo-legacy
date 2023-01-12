<template>
    <b-spinner variant="primary"></b-spinner>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ChainId } from '../types/enums/ChainId';
import { mapGetters } from 'vuex';
import { IPools } from '../store/modules/pools';
import { track } from '../utils/mixpanel';
import { IAccount } from '../types/account';

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

        // List pools to see if we need to deploy a first
        await this.$store.dispatch('pools/list');
        if (!Object.values(this.pools).length) this.$store.dispatch('pools/create', { chainId: ChainId.Hardhat });

        track.UserSignin(this.profile);

        this.$router.push('/');
    }
}
</script>
