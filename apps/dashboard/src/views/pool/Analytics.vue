<template>
    <div>
        <h2 class="mb-3">Analytics</h2>
        <b-tabs class="w-100" nav-class="w-100">
            <b-tab active class="mt-3">
                <template #title>
                    <i class="fas fa-columns mr-1"></i>
                    Metrics
                </template>
                <BaseTabAnalyticsMetrics :pool="pool" />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-trophy mr-1"></i>
                    Quests
                </template>
                <BaseTabAnalyticsQuests :pool="pool" />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-gift mr-1"></i>
                    Rewards
                </template>
                <BaseTabAnalyticsRewards :pool="pool" />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-users mr-1"></i>
                    Participants
                </template>
                <BaseTabAnalyticsParticipants :pool="pool" />
            </b-tab>
            <b-tab active disabled>
                <template #title>
                    <i class="fas fa-bell mr-1"></i>
                    Subscribers
                </template>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import BaseTabAnalyticsMetrics from '@thxnetwork/dashboard/views/pool/analytics/Metrics.vue';
import BaseTabAnalyticsQuests from '@thxnetwork/dashboard/views/pool/analytics/Quests.vue';
import BaseTabAnalyticsRewards from '@thxnetwork/dashboard/views/pool/analytics/Rewards.vue';
import BaseTabAnalyticsParticipants from '@thxnetwork/dashboard/views/pool/analytics/Participants.vue';

@Component({
    components: {
        BaseTabAnalyticsMetrics,
        BaseTabAnalyticsQuests,
        BaseTabAnalyticsRewards,
        BaseTabAnalyticsParticipants,
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
