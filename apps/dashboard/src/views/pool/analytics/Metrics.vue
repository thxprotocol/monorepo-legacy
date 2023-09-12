<template>
    <b-row v-if="pool">
        <b-col md="8">
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
                    v-for="(metric, key) of [metrics.coinReward, metrics.nftReward, metrics.customReward]"
                >
                    <b-card v-if="metrics" bg-variant="white" class="text-dark" body-class="py-2 px-3">
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
                    <div class="card-header block">Leaderboard</div>
                    <b-skeleton-wrapper :loading="!leaderBoard">
                        <template #loading>
                            <b-skeleton-table
                                :rows="2"
                                :columns="1"
                                :table-props="{ bordered: false, striped: false }"
                            ></b-skeleton-table>
                        </template>
                        <b-list-group v-if="leaderBoard">
                            <b-list-group-item
                                v-for="(result, key) of leaderBoard"
                                :key="key"
                                class="d-flex justify-content-between align-items-center"
                            >
                                <div class="d-flex center-center">
                                    <b-avatar
                                        :height="30"
                                        :width="30"
                                        variant="light"
                                        :src="result.account.profileImg"
                                        class="mr-2"
                                    />
                                    <div style="line-height: 1.2">
                                        <strong> {{ result.account.firstName }} {{ result.account.lastName }} </strong>
                                        <span>{{ result.account.email }}</span>
                                        <br />
                                        <small class="text-muted">{{ result.account.address }}</small>
                                    </div>
                                </div>
                                <div>
                                    <i class="fas fa-trophy m-1" style="font-size: 1.1rem; color: silver"></i>
                                    <strong class="text-primary"> {{ result.score }} </strong>
                                </div>
                            </b-list-group-item>
                        </b-list-group>
                    </b-skeleton-wrapper>
                </b-col>
            </b-row>
            <b-row class="mt-3" v-if="!erc20s">
                <b-col>
                    <div class="py-5 w-100 center-center">
                        <b-spinner variant="primary" />
                    </div>
                </b-col>
            </b-row>
            <b-row class="mt-3" v-else>
                <b-col>
                    <b-list-group>
                        <b-list-group-item
                            :key="erc20._id"
                            v-for="erc20 of Object.values(erc20s).filter((e) => e.chainId === pool.chainId)"
                            class="d-flex justify-content-between align-items-center"
                        >
                            <div class="d-flex center-center">
                                <base-identicon
                                    class="mr-2"
                                    size="40"
                                    :rounded="true"
                                    variant="darker"
                                    :uri="erc20.logoImgUrl"
                                />
                                <div style="line-height: 1.2">
                                    <strong>{{ erc20.name }}</strong>
                                    <div class="text-muted" v-if="erc20.poolBalance">
                                        {{ fromWei(String(erc20.poolBalance), 'ether') }} {{ erc20.symbol }}
                                    </div>
                                </div>
                            </div>
                            <b-button v-b-modal="`modalDepositCreate-${erc20._id}`" variant="light">
                                <i class="fas fa-download m-0" style="font-size: 1.1rem"></i>
                            </b-button>
                            <BaseModalDepositCreate @submit="onTopup(erc20)" :erc20="erc20" :pool="pool" />
                        </b-list-group-item>
                        <b-list-group-item
                            v-if="!Object.values(erc20s).filter((e) => e.chainId === pool.chainId).length"
                        >
                            <span class="text-muted">No coins found for your account.</span>
                        </b-list-group-item>
                        <b-list-group-item>
                            <b-button v-b-modal="'modalERC20Import'" block variant="primary" class="rounded-pill">
                                Import coin
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                            <b-button v-b-modal="'modalERC20Create'" block variant="link" class="rounded-pill">
                                Create coin
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </b-list-group-item>
                    </b-list-group>
                </b-col>
            </b-row>

            <BaseModalErc20Create :chainId="pool.chainId" />
            <BaseModalErc20Import :chainId="pool.chainId" />
        </b-col>
    </b-row>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IERC20s, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseModalErc20Import from '@thxnetwork/dashboard/components/modals/BaseModalERC20Import.vue';
import BaseModalErc20Create from '@thxnetwork/dashboard/components/modals/BaseModalERC20Create.vue';
import BaseModalDepositCreate from '@thxnetwork/dashboard/components/modals/BaseModalDepositCreate.vue';
import { fromWei } from 'web3-utils';
import { format } from 'date-fns';
import { IPoolAnalyticsLeaderBoard, IPoolAnalyticsMetrics, IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { TPool } from '@thxnetwork/types/interfaces';

@Component({
    components: {
        BaseIdenticon,
        BaseModalDepositCreate,
        BaseModalErc20Create,
        BaseModalErc20Import,
    },
    computed: mapGetters({
        pools: 'pools/all',
        analyticsMetrics: 'pools/analyticsMetrics',
        analyticsLeaderboard: 'pools/analyticsLeaderBoard',
        erc20s: 'erc20/all',
    }),
})
export default class ViewAnalyticsMetrics extends Vue {
    metricQuestsLabelMap = ['Daily', 'Invite', 'Social', 'Custom', 'Web3'];
    metricQuestsInfoMap = [
        'Daily Quest qualifications versus completed and the total amount of points earned.',
        'Invite Quest leads qualified and the total amount of points earned.',
        'Social Quests completed and the total amount of points earned.',
        'Custom Quest qualifications versus completions and the total amount of points earned.',
        'Web3 Quests completed and the total amount of points earned.',
    ];
    metricRewardLabelMap = ['Coin', 'NFT', 'Custom'];
    fromWei = fromWei;
    pools!: IPools;
    erc20s!: IERC20s;
    loading = false;
    format = format;
    analyticsLeaderboard!: IPoolAnalyticsLeaderBoard;
    analyticsMetrics!: IPoolAnalyticsMetrics;
    daysRange = 14;

    @Prop() pool!: TPool;

    get leaderBoard() {
        if (!this.analyticsLeaderboard[this.$route.params.id]) return null;
        return this.analyticsLeaderboard[this.$route.params.id];
    }

    get metrics() {
        if (!this.analyticsMetrics[this.$route.params.id]) return null;
        return this.analyticsMetrics[this.$route.params.id];
    }

    formatDateLabel(date: Date): string {
        const month = date.getUTCMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    async onTopup(erc20: TERC20) {
        await this.$store.dispatch('erc20/read', erc20._id);
        this.$store.dispatch('erc20/getBalance', { id: erc20._id, address: this.pool.address });
    }

    async mounted() {
        this.loading = true;
        this.$store.dispatch('pools/readAnalyticsMetrics', { poolId: this.pool._id });
        this.$store.dispatch('pools/readAnalyticsLeaderBoard', { poolId: this.pool._id });
        this.$store.dispatch('erc20/list').then(() =>
            Promise.all(
                Object.values(this.erc20s).map(async (erc20) => {
                    await this.$store.dispatch('erc20/read', erc20._id);
                    await this.$store.dispatch('erc20/getBalance', { id: erc20._id, address: this.pool.address });
                }),
            ),
        );
        this.loading = false;
    }
}
</script>
