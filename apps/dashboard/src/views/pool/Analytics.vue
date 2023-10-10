<template>
    <div class="mb-3">
        <h2 class="mb-3">Analytics</h2>
        <b-tabs class="w-100" nav-class="w-100">
            <b-tab active class="mt-3">
                <template #title>
                    <i class="fas fa-tachometer-alt mr-1"></i>
                    Metrics
                </template>
                <BaseTabAnalyticsMetrics :pool="pool" />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-chart-line mr-1"></i>
                    Charts
                </template>
                <BaseTabAnalyticsCharts :pool="pool" />
            </b-tab>
        </b-tabs>
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import BaseTabAnalyticsMetrics from '@thxnetwork/dashboard/views/pool/analytics/Metrics.vue';
import BaseTabAnalyticsCharts from '@thxnetwork/dashboard/views/pool/analytics/Charts.vue';

@Component({
    components: {
        BaseTabAnalyticsMetrics,
        BaseTabAnalyticsCharts,
    },
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class ViewAnalytics extends Vue {
    pools!: IPools;
    loading = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async mounted() {
        this.loading = true;
        await this.$store.dispatch('pools/read', this.$route.params.id);
        this.loading = false;
    }
}
</script>
