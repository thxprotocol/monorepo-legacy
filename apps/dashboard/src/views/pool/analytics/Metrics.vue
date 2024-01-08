<template>
    <b-row v-if="pool">
        <b-col md="8">
            <strong class="text-muted">Campaign</strong>
            <b-row class="mt-3" v-if="metrics">
                <b-col md="6">
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
                <b-col md="6">
                    <b-card bg-variant="white" class="text-dark mb-2" body-class="py-2 px-3">
                        <div class="text-gray d-flex align-content-between">
                            Subscribers
                            <b-link v-b-tooltip title="Participants that subscribed for new quests." class="ml-auto">
                                <i class="fas fa-question-circle"></i>
                            </b-link>
                        </div>
                        <div class="h2 mb-0">
                            {{
                                metrics.subscriptionCount > 0
                                    ? ((metrics.subscriptionCount / metrics.participantCount) * 100).toFixed(2)
                                    : 0
                            }}%
                        </div>
                        <small>{{ metrics.subscriptionCount }} participants subscribed</small>
                    </b-card>
                </b-col>
            </b-row>
            <hr />
            <strong class="text-muted">Quests</strong>
            <BaseChartQuests />
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
                    <b-card v-if="metrics" bg-variant="white" class="text-dark mb-3" body-class="py-2 px-3">
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
            <BaseChartRewards />
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
                    <b-card v-if="metrics" bg-variant="white" class="text-dark mb-3" body-class="py-2 px-3">
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
                    <strong class="text-muted">Date range</strong>
                    <b-card class="mt-3">
                        <b-form-group label="Last">
                            <b-input-group append="days">
                                <b-form-input
                                    min="1"
                                    max="1000"
                                    :value="daysRange"
                                    @change="onChangeDaysRange"
                                    type="number"
                                />
                            </b-input-group>
                        </b-form-group>
                        <b-button
                            block
                            :disabled="isLoading"
                            variant="primary"
                            class="rounded-pill"
                            @click="onClickUpdate"
                        >
                            <b-spinner v-if="isLoading" small />
                            <template v-else>Update</template>
                        </b-button>
                    </b-card>
                    <p><strong class="text-muted">Leaderboard</strong></p>
                    <b-list-group v-if="leaderboard.results.length">
                        <b-list-group-item
                            v-for="(result, key) of leaderboard.results"
                            :key="key"
                            class="d-flex justify-content-between align-items-center pl-3"
                        >
                            <div class="d-flex center-center">
                                <div class="mr-3 text-gray">#{{ result.rank }}</div>
                                <!-- <b-badge variant="light" class="mr-3 p-2">#{{ result.rank }}</b-badge> -->
                                <b-avatar size="25" variant="light" :src="result.account.profileImg" class="mr-3" />
                                <div>
                                    {{ result.account.username }}
                                    <sup
                                        v-if="result.subscription"
                                        v-b-tooltip
                                        :title="`Subscribed since ${format(
                                            new Date(result.subscription.createdAt),
                                            'dd-MM-yyyy HH:mm',
                                        )}`"
                                    >
                                        <i class="fa fa-star text-primary" style="font-size: 0.8rem" />
                                    </sup>
                                </div>
                            </div>
                            <div class="ml-auto text-right">
                                <strong class="text-primary"> {{ result.questEntryCount }} </strong>
                                <i class="fa fa-tasks text-primary" style="font-size: 0.8rem" />
                            </div>
                            <div style="min-width: 75px" class="text-right">
                                <strong class="text-primary"> {{ result.score }} </strong>
                            </div>
                        </b-list-group-item>
                    </b-list-group>
                    <p v-else class="text-gray">Could not find any campaign participants yet!</p>
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
import BaseChartQuests from '@thxnetwork/dashboard/components/charts/BaseChartQuests.vue';
import BaseChartRewards from '@thxnetwork/dashboard/components/charts/BaseChartRewards.vue';

const ONE_DAY = 86400000; // one day in milliseconds

@Component({
    components: {
        BaseIdenticon,
        BaseChartQuests,
        BaseChartRewards,
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
    isLoading = false;
    leaderboard: { total: number; results: any[] } = {
        total: 0,
        results: [],
    };
    analyticsMetrics!: IPoolAnalyticsMetrics;
    daysRange = 14;

    @Prop() pool!: TPool;

    get metrics() {
        if (!this.analyticsMetrics[this.$route.params.id]) return null;
        debugger;
        return this.analyticsMetrics[this.$route.params.id];
    }

    formatDateLabel(date: Date): string {
        const month = date.getUTCMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    async mounted() {
        this.isLoading = true;
        await this.getAnalytics();
        await this.getLeaderboard();
        this.isLoading = false;
    }

    async getLeaderboard() {
        this.leaderboard = await this.$store.dispatch('pools/participants', {
            pool: this.pool,
            page: 1,
            limit: 10,
        });
    }

    async getAnalytics() {
        const endDate = new Date();

        endDate.setHours(0, 0, 0, 0);
        const startDate = new Date(new Date(endDate).getTime() - ONE_DAY * this.daysRange);
        endDate.setHours(23, 59, 59, 0);

        await this.$store.dispatch('pools/readAnalyticsMetrics', { poolId: this.pool._id, startDate, endDate });
        debugger;
    }

    onChangeDaysRange(daysRange: number) {
        this.daysRange = daysRange;
    }

    onClickUpdate() {
        this.getAnalytics();
    }
}
</script>
