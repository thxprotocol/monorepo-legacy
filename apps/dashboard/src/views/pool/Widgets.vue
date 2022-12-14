<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Widgets</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button
                    v-b-modal="'modalWidgetCreate'"
                    :disabled="!filteredRewards.length"
                    class="float-right rounded-pill"
                    variant="primary"
                >
                    <i class="fas fa-plus mr-2"></i>
                    <span>Create a widget</span>
                </b-button>
            </b-col>
        </b-row>

        <b-alert v-if="!filteredRewards.length" variant="info" show>
            Your asset pool has no rewards configured.
        </b-alert>

        <base-nothing-here
            v-if="!filteredWidgets.length"
            text-submit="Create a Widget"
            title="You have not created a widget yet"
            description="Embed HTML widgets in your website or blog and let people claim your tokens."
            :disabled="!filteredRewards.length"
            @clicked="$bvModal.show('modalWidgetCreate')"
        />

        <b-card class="shadow-sm" v-else>
            <div class="row pt-2 pb-2">
                <div class="col-md-4">
                    <strong>Page URL</strong>
                </div>
                <div class="col-md-2">
                    <strong>Reward</strong>
                </div>
                <div class="col-md-2">
                    <strong>Type</strong>
                </div>
                <div class="col-md-2"></div>
            </div>
            <b-skeleton-wrapper :loading="skeletonLoading">
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
                <b-form-group class="mb-0" :key="widget.clientId" v-for="widget of widgets[pool._id]">
                    <hr />
                    <div class="row pt-2 pb-2">
                        <div class="col-md-4 d-flex align-items-center">
                            {{ widget.requestUri }}
                        </div>
                        <div class="col-md-2 d-flex align-items-center">
                            <template v-if="widget.reward">
                                {{ widget.reward.withdrawAmount }} {{ pool.erc20.symbol }}
                            </template>
                        </div>
                        <div class="col-md-2 d-flex align-items-center">Claim Button</div>
                        <div class="col-md-4 text-right">
                            <b-button
                                class="rounded-pill"
                                variant="light"
                                v-b-modal="`modalWidgetEdit-${widget.clientId}`"
                            >
                                <i class="fas fa-pencil-alt text-primary ml-0"></i>
                            </b-button>
                            <b-button
                                class="rounded-pill ml-1"
                                variant="light"
                                v-b-modal="`modalDelete-${widget.clientId}`"
                            >
                                <i class="far fa-trash-alt text-primary ml-0"></i>
                            </b-button>
                        </div>
                    </div>
                    <base-modal-widget-edit :pool="pool" :filteredRewards="filteredRewards" :widget="widget" />
                    <modal-delete :id="`modalDelete-${widget.clientId}`" :call="remove" :subject="widget.clientId" />
                </b-form-group>
            </b-skeleton-wrapper>
        </b-card>

        <base-modal-widget-create @submit="getWidgets()" :pool="pool" :filteredRewards="filteredRewards" />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IRewards, Reward } from '@thxnetwork/dashboard/types/rewards';
import { IWidgets, Widget } from '@thxnetwork/dashboard/store/modules/widgets';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import BaseModalWidgetCreate from '@thxnetwork/dashboard/components/modals/BaseModalWidgetCreate.vue';
import BaseModalWidgetEdit from '@thxnetwork/dashboard/components/modals/BaseModalWidgetEdit.vue';
import ModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';

@Component({
    components: {
        BaseNothingHere,
        BaseModalWidgetCreate,
        BaseModalWidgetEdit,
        ModalDelete,
    },
    computed: mapGetters({
        pools: 'pools/all',
        rewards: 'rewards/all',
        widgets: 'widgets/all',
    }),
})
export default class WidgetsView extends Vue {
    docsUrl = process.env.VUE_APP_DOCS_URL;
    apiUrl = process.env.VUE_APP_API_ROOT;

    error = '';
    loading = true;
    skeletonLoading = true;

    pools!: IPools;
    rewards!: IRewards;
    widgets!: IWidgets;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get filteredWidgets(): Widget[] {
        return this.widgets[this.pool.address] || [];
    }

    get filteredRewards(): Reward[] {
        if (!this.rewards[this.pool._id]) return [];
        return Object.values(this.rewards[this.pool._id]);
    }

    async getWidgets() {
        await this.$store.dispatch('widgets/list', this.pool._id);

        for (const clientId in this.widgets[this.pool._id]) {
            const widget = this.widgets[this.pool._id][clientId];
            const reward = this.rewards[this.pool._id][widget.metadata.rewardUuid];

            this.widgets[this.pool._id][clientId].setReward(reward);
        }
    }

    async mounted() {
        try {
            await this.$store.dispatch('account/getProfile');
            await this.$store.dispatch('rewards/list', this.pool._id);
            await this.getWidgets();
            this.skeletonLoading = false;
        } catch (e) {
            this.error = 'Could not get the rewards.';
        } finally {
            this.loading = false;
        }
    }

    async remove(clientId: string) {
        this.loading = true;
        try {
            await this.$store.dispatch('widgets/remove', {
                clientId,
                poolId: this.pool._id,
            });
        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }
}
</script>
