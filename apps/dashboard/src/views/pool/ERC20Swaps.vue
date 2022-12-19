<template>
    <div class="container pt-3 h-100 d-flex flex-column">
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Swaps</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button
                    :disabled="loading"
                    class="btn rounded-pill"
                    @click="$bvModal.show('modalERC20SwapRuleCreate')"
                    variant="primary"
                >
                    Create Swap Rule
                </b-button>
            </b-col>
        </b-row>

        <b-card class="shadow-sm">
            <div class="row pt-2 pb-2">
                <div class="col-md-6">
                    <strong>Token In</strong>
                </div>
                <div>
                    <strong>Token Multiplier</strong>
                </div>
            </div>
            <b-skeleton-wrapper :loading="loading">
                <template #loading>
                    <b-form-group class="mb-0">
                        <hr />
                        <div class="row pt-2 pb-2">
                            <div class="col-md-4">
                                <b-skeleton animation="fade" width="85%"></b-skeleton>
                                <b-skeleton animation="fade" width="80%"></b-skeleton>
                            </div>
                            <div class="col-md-2">
                                <b-skeleton animation="fade" width="85%"></b-skeleton>
                                <b-skeleton animation="fade" width="80%"></b-skeleton>
                            </div>
                            <div class="col-md-4 text-right d-flex justify-content-end">
                                <b-skeleton type="avatar" class="inline"></b-skeleton>
                                <b-skeleton type="avatar" class="inline ml-1"></b-skeleton>
                            </div>
                        </div>
                    </b-form-group>
                </template>
                <base-form-group-swap-rule
                    :swap-rule="swapRule"
                    :key="swapRule._id"
                    v-for="swapRule of swapRulesByPage"
                />
                <div class="container container-md">
                    <base-nothing-here
                        v-if="total == 0"
                        text-submit="Create a Swap Rule"
                        title="You have not created a Swap Rule yet"
                        @clicked="$bvModal.show('modalERC20SwapRuleCreate')"
                    />
                </div>
            </b-skeleton-wrapper>
        </b-card>
        <b-pagination
            class="mt-3"
            @change="onChangePage"
            v-model="page"
            :per-page="limit"
            :total-rows="total"
            align="center"
        ></b-pagination>
        <ModalERC20SwapRuleCreate :onSuccess="onSwapRuleCreated" />
    </div>
</template>

<script lang="ts">
import ModalERC20SwapRuleCreate from '@thxnetwork/dashboard/components/modals/BaseModalERC20SwapRuleCreate.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import type {
    GetERC20SwapRulesProps,
    IERC20SwapRules,
    TERC20SwapRule,
} from '@thxnetwork/dashboard/types/IERC20SwapRules';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseFormGroupSwapRule from '@thxnetwork/dashboard/components/form-group/BaseFormGroupSwapRule.vue';

@Component({
    components: {
        BaseFormGroupSwapRule,
        ModalERC20SwapRuleCreate,
        BaseNothingHere,
        BaseIdenticon,
    },
    computed: mapGetters({
        totals: 'swaprules/totals',
        swaprules: 'swaprules/all',
        pools: 'pools/all',
    }),
})
export default class ERC20Swaps extends Vue {
    loading = false;
    page = 1;
    limit = 10;

    swaprules!: IERC20SwapRules;
    totals!: { [poolId: string]: number };
    pools!: IPools;

    get swapRulesByPage() {
        if (!this.swaprules[this.$route.params.id]) return [];
        return Object.values(this.swaprules[this.$route.params.id])
            .filter((client: TERC20SwapRule) => client.page === this.page)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, 5);
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async getMoreResults({ pool, page, limit }: GetERC20SwapRulesProps) {
        this.loading = true;
        await this.$store.dispatch('swaprules/list', {
            pool: pool,
            page,
            limit,
        });
        this.loading = false;
    }

    onSwapRuleCreated() {
        this.page = 1;
        this.onChangePage(1);
    }

    onChangePage(page: number) {
        this.getMoreResults({
            pool: this.pool,
            page: page,
            limit: this.limit,
        });
    }

    mounted() {
        this.getMoreResults({
            pool: this.pool,
            page: this.page,
            limit: this.limit,
        });
    }
}
</script>
