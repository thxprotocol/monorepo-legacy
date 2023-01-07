<template>
    <b-spinner variant="primary"></b-spinner>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ChainId } from '../types/enums/ChainId';
import { mapGetters } from 'vuex';
import { IPools } from '../store/modules/pools';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class Redirect extends Vue {
    pools!: IPools;

    async mounted() {
        await this.$store.dispatch('account/signinRedirectCallback');
        await this.$store.dispatch('account/getProfile');

        // List pools to see if we need to deploy a first
        await this.$store.dispatch('pools/list');
        if (!this.pools.length) this.$store.dispatch('pools/create', { chainId: ChainId.Hardhat });

        this.$router.push('/');
    }
}
</script>
