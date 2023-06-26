<template>
    <div>...</div>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {},
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class Clients extends Vue {
    pools!: IPools;
    limit = 10;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        this.$store.dispatch('wallets/list', { limit: this.limit, pool: this.pool });
    }
}
</script>
