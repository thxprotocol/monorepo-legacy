<template>
    <b-modal
        size="lg"
        title="Create Widget"
        id="modalWidgetCreate"
        no-close-on-backdrop
        no-close-on-esc
        centered
        @show="onShow()"
        :hide-footer="loading"
    >
        <template v-slot:modal-header v-if="loading">
            <div
                class="w-auto center-center bg-secondary mx-n5 mt-n5 pt-5 pb-5 flex-grow-1 flex-column position-relative"
                :style="`
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-image: url(${require('../../../public/assets/thx_modal-header.webp')});
                `"
            >
                <h2 class="d-block">Uno momento!</h2>
                <div
                    class="shadow-sm bg-white p-2 rounded-pill d-flex align-items-center justify-content-center"
                    style="position: absolute; bottom: 0; left: 50%; margin-left: -32px; margin-bottom: -32px"
                >
                    <b-spinner size="lg" style="width: 3rem; height: 3rem" variant="primary"></b-spinner>
                </div>
            </div>
        </template>
        <div class="pt-5 pb-3" v-if="loading">
            <p class="text-center">
                <strong>We are assembling your widget</strong><br /><span class="text-muted">
                    This should be done real soon.
                </span>
            </p>
        </div>
        <form v-else v-on:submit.prevent="submit" id="formWidgetCreate">
            <b-alert variant="danger" show v-if="error">
                {{ error }}
            </b-alert>
            <b-card bg-variant="light" class="border-0" body-class="p-5" v-else>
                <b-form-group>
                    <label>Select widget</label>
                    <b-form-select v-model="widgetType">
                        <b-form-select-option :value="0"> Claim Button </b-form-select-option>
                    </b-form-select>
                </b-form-group>
                <b-form-group>
                    <label>Select reward</label>
                    <b-form-select v-model="widgetReward">
                        <b-form-select-option :key="reward.id" v-for="reward of filteredRewards" :value="reward">
                            #{{ reward.id }} ({{ reward.withdrawAmount }} {{ pool.erc20.symbol }})
                        </b-form-select-option>
                    </b-form-select>
                </b-form-group>
                <b-form-group>
                    <label>Page URL</label>
                    <b-form-input v-model="widgetRequestUri" placeholder="http://www.yoursite.com" />
                </b-form-group>
            </b-card>
        </form>
        <template v-slot:modal-footer="{}">
            <b-button
                :disabled="loading"
                class="rounded-pill"
                type="submit"
                variant="primary"
                form="formWidgetCreate"
                block
            >
                Add Widget
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type { Reward } from '@thxnetwork/dashboard/types/rewards';

@Component({
    computed: mapGetters({
        clients: 'clients/all',
    }),
})
export default class ModalWidgetCreate extends Vue {
    docsUrl = process.env.VUE_APP_DOCS_URL;
    loading = false;
    error = '';

    widgetType = 0;
    widgetReward: Reward | null = null;
    widgetRequestUri = '';

    @Prop() pool!: IPool;
    @Prop() filteredRewards!: Reward[];

    onShow() {
        this.widgetType = 0;
        this.widgetReward = this.filteredRewards[0];
    }

    async submit() {
        this.loading = true;
        try {
            await this.$store.dispatch('widgets/create', {
                requestUris: [this.widgetRequestUri],
                redirectUris: [this.widgetRequestUri],
                postLogoutRedirectUris: [this.widgetRequestUri],
                metadata: {
                    rewardUuid: this.widgetReward?.uuid,
                    poolId: this.pool._id,
                    poolAddress: this.pool.address,
                },
            });
            this.$emit('submit');
            this.$bvModal.hide(`modalWidgetCreate`);
        } catch (e) {
            this.error = 'Could not add the widget.';
        } finally {
            this.loading = false;
        }
    }
}
</script>
<style lang="scss"></style>
