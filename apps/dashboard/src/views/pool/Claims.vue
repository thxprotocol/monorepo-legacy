<template>
    <b-row class="mb-3">
        <b-col class="d-flex align-items-center">
            <h2 class="mb-0">Clients</h2>
        </b-col>
        <b-col class="d-flex justify-content-end">
            <BTable striped hover sticky-header :busy="isLoading" :items="claims" responsive="sm"></BTable>
        </b-col>
    </b-row>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {},
    computed: mapGetters({
        claims: 'claims/all',
        pools: 'pools/all',
    }),
})
export default class Claims extends Vue {
    isLoading = false;

    claims!: any;
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        this.$store.dispatch('claims/list');
    }
}
</script>
