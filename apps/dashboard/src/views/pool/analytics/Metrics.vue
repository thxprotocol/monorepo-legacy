<template>
    <b-row v-if="pool">
        <b-col md="8">
            <strong class="text-muted">Campaign</strong>
            <b-row class="mt-3" v-if="metrics">
                <b-col md="4">
                    <b-card bg-variant="white" class="text-dark mb-2" body-class="py-2 px-3">
                        <div class="text-gray d-flex align-content-between">
                            Participants
                            <b-link v-b-tooltip title="Authenticated users that visited your campaign." class="ml-auto">
                                <i class="fas fa-question-circle"></i>
                            </b-link>
                        </div>
                        <div class="h2 mb-0">{{ metrics.participantCount }}</div>
                        <small>{{ metrics.participantActiveCount }} completed quests</small>
                    </b-card>
                </b-col>
                <b-col md="4">
                    <b-card bg-variant="white" class="text-dark mb-2" body-class="py-2 px-3">
                        <div class="text-gray d-flex align-content-between">
                            Subscriptions
                            <b-link v-b-tooltip title="Participants that subscribed for new quests." class="ml-auto">
                                <i class="fas fa-question-circle"></i>
                            </b-link>
                        </div>
                        <div class="h2 mb-0">
                            {{ ((metrics.subscriptionCount / metrics.participantCount) * 100).toFixed(2) }}%
                        </div>
                        <small>{{ metrics.subscriptionCount }} participants subscribed</small>
                    </b-card>
                </b-col>
            </b-row>
            <hr />
            <strong class="text-muted">Quests</strong>
            <b-row class="mt-3" v-if="metrics">
                <b-col
                    md="4"
                    :key="key"
                    v-for="(metric, key) of [
                        metrics.dailyQuest,
                        metrics.inviteQuest,
                        metrics.socialQuest,
                        metrics.customQuest,
                        metrics.web3Quest,
                    ]"
                >
                    <b-card v-if="metrics" bg-variant="white" class="text-dark mb-2" body-class="py-2 px-3">
                        <div class="text-gray d-flex align-content-between">
                            {{ metricQuestsLabelMap[key] }}
                            <b-link v-b-tooltip :title="metricQuestsInfoMap[key]" class="ml-auto">
                                <i class="fas fa-question-circle"></i>
                            </b-link>
                        </div>
                        <div class="h2 mb-0">
                            {{ metric.totalCreated }}
                            {{ [0, 3].includes(key) ? `/${metric.totalCompleted}` : '' }}
                        </div>
                        <small>{{ metric.totalAmount }} points</small>
                    </b-card>
                </b-col>
            </b-row>
            <hr />
            <strong class="text-muted">Rewards</strong>
            <b-row class="mt-3" v-if="metrics">
                <b-col
                    md="4"
                    :key="key"
                    v-for="(metric, key) of [
                        metrics.coinReward,
                        metrics.nftReward,
                        metrics.customReward,
                        metrics.couponReward,
                        metrics.discordRoleReward,
                    ]"
                >
                    <b-card v-if="metrics" bg-variant="white" class="text-dark mb-2" body-class="py-2 px-3">
                        <span class="text-gray">{{ metricRewardLabelMap[key] }}</span>
                        <br />
                        <div class="h2 mb-0">
                            {{ metric.totalCreated }}
                        </div>
                        <small>{{ metric.totalAmount }} points</small>
                    </b-card>
                </b-col>
            </b-row>
        </b-col>

        <b-col md="4">
            <b-row>
                <b-col>
                    <strong class="text-muted">Leaderboard</strong>
                    <b-skeleton-wrapper :loading="!leaderboard.results.length">
                        <template #loading>
                            <b-skeleton-table
                                :rows="2"
                                :columns="1"
                                :table-props="{ bordered: false, striped: false }"
                            ></b-skeleton-table>
                        </template>
                        <b-list-group class="mt-3" v-if="leaderboard.results.length">
                            <b-list-group-item
                                v-for="(result, key) of leaderboard.results"
                                :key="key"
                                class="d-flex justify-content-between align-items-center"
                            >
                                <div class="d-flex center-center">
                                    <b-badge variant="light" class="mr-3 p-2">#{{ key + 1 }}</b-badge>
                                    <b-avatar size="25" variant="light" :src="result.account.profileImg" class="mr-2" />
                                    <div style="line-height: 1.2">{{ result.account.username }}</div>
                                </div>
                                <div>
                                    <strong class="text-primary"> {{ result.score }} </strong>
                                </div>
                            </b-list-group-item>
                        </b-list-group>
                    </b-skeleton-wrapper>
                </b-col>
            </b-row>
        </b-col>
    </b-row>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { fromWei } from 'web3-utils';
import { format } from 'date-fns';
import { IPoolAnalyticsMetrics, IPools } from '@thxnetwork/dashboard/store/modules/pools';
import type { TPool } from '@thxnetwork/types/interfaces';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        pools: 'pools/all',
        analyticsMetrics: 'pools/analyticsMetrics',
        analyticsLeaderboard: 'pools/analyticsLeaderBoard',
    }),
})
export default class ViewAnalyticsMetrics extends Vue {
    fromWei = fromWei;
    format = format;
    metricQuestsLabelMap = ['Daily', 'Invite', 'Social', 'Custom', 'Web3'];
    metricQuestsInfoMap = [
        'Daily Quest qualifications versus completed and the total amount of points earned.',
        'Invite Quest leads qualified and the total amount of points earned.',
        'Social Quests completed and the total amount of points earned.',
        'Custom Quest qualifications versus completions and the total amount of points earned.',
        'Web3 Quests completed and the total amount of points earned.',
    ];
    metricRewardLabelMap = ['Coin', 'NFT', 'Custom', 'Coupon', 'Discord Role'];
    pools!: IPools;
    loading = false;
    leaderboard: { total: number; results: any[] } = {
        total: 0,
        results: [],
    };
    analyticsMetrics!: IPoolAnalyticsMetrics;
    daysRange = 14;

    @Prop() pool!: TPool;

    get metrics() {
        if (!this.analyticsMetrics[this.$route.params.id]) return null;
        return this.analyticsMetrics[this.$route.params.id];
    }

    formatDateLabel(date: Date): string {
        const month = date.getUTCMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    async mounted() {
        this.loading = true;
        this.$store.dispatch('pools/readAnalyticsMetrics', { poolId: this.pool._id });
        this.leaderboard = await this.$store.dispatch('pools/participants', {
            pool: this.pool,
            page: 1,
            limit: 10,
        });
        this.loading = false;
    }
}
</script>
