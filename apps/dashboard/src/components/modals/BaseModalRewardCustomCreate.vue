<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Custom Reward'"
        :id="id"
        :error="error"
    >
        <template #modal-body>
            <form v-on:submit.prevent="onSubmit()" id="formRewardCustomCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Webhook">
                            <b-dropdown variant="link" class="dropdown-select" v-if="webhookList.length">
                                <template #button-content>
                                    <div class="d-flex align-items-center" v-if="webhook">
                                        <i class="fas fa-globe text-muted mr-2"></i>
                                        <span class="mr-1">{{ webhook.url }}</span>
                                    </div>
                                    <div v-else>Select a Webhook</div>
                                </template>
                                <b-dropdown-item-button :key="key" v-for="(w, key) of webhookList" @click="webhook = w">
                                    {{ w.url }}
                                </b-dropdown-item-button>
                                <b-dropdown-divider />
                            </b-dropdown>
                        </b-form-group>
                        <b-form-group label="Metadata" description="Provide metadata for your system to use.">
                            <b-textarea v-model="metadata" />
                        </b-form-group>
                        <b-form-group label="Point Price">
                            <b-form-input type="number" :value="pointPrice" @input="onChangePointPrice" />
                        </b-form-group>
                        <b-form-group label="Image">
                            <b-input-group>
                                <template #prepend v-if="image">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="image" height="35" width="auto" />
                                    </div>
                                </template>
                                <b-form-file v-model="imageFile" accept="image/*" @change="onImgChange" />
                            </b-input-group>
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits class="mb-3" :limit="limit" @change-reward-limit="limit = $event" />
                        <b-form-group>
                            <b-form-checkbox v-model="isPromoted">Promoted</b-form-checkbox>
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardCustomCreate"
                variant="primary"
                block
            >
                <b-spinner small v-if="isLoading" />
                <template v-else>
                    {{ (reward ? 'Update' : 'Create') + ' Custom Reward' }}
                </template>
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import type { TCustomReward, TAccount, TPool, TWebhook } from '@thxnetwork/types/interfaces';
import { RewardVariant } from '@thxnetwork/types/enums';
import { TWebhookState } from '@thxnetwork/dashboard/store/modules/webhooks';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
        webhooks: 'webhooks/all',
    }),
})
export default class ModalRewardCustomCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;

    pools!: IPools;
    profile!: TAccount;
    webhooks!: TWebhookState;

    webhook: TWebhook | null = null;
    webhookId = '';
    metadata = '';
    error = '';
    title = '';
    description = '';
    expiryDate: Date | null = null;
    claimAmount = 0;
    claimLimit = 0;
    limit = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    isPromoted = false;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TCustomReward;

    get webhookList() {
        if (!this.webhooks[this.pool._id]) return [];
        return Object.values(this.webhooks[this.pool._id]);
    }

    onShow() {
        this.metadata = this.reward ? this.reward.metadata : this.metadata;
        this.webhookId = this.reward ? this.reward.webhookId : '';
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.pointPrice = this.reward ? this.reward.pointPrice : 0;
        this.expiryDate = this.reward ? this.reward.expiryDate : null;
        this.limit = this.reward ? this.reward.limit : 0;
        this.claimAmount = this.reward ? this.reward.claimAmount : this.claimAmount;
        this.claimLimit = this.reward ? this.reward.claimLimit : this.claimLimit;
        this.image = this.reward ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : false;
        this.$store.dispatch('webhooks/list', this.pool).then(() => {
            this.webhook = this.webhooks[this.pool._id][this.webhookId];
        });
    }

    onChangePointPrice(price: number) {
        this.pointPrice = price;
        if (price > 0) this.claimAmount = 0;
    }

    onChangeClaimAmount(amount: number) {
        this.claimAmount = amount;
        if (amount > 0) this.pointPrice = 0;
    }

    onChangeClaimLimit(limit: number) {
        this.claimLimit = limit;
    }

    async onSubmit() {
        if (!this.webhook) {
            this.error = 'Choose a webhook';
            return;
        }
        this.isLoading = true;
        this.isSubmitDisabled = true;

        await this.$store.dispatch(`rewards/${this.reward ? 'update' : 'create'}`, {
            ...this.reward,
            variant: RewardVariant.Custom,
            webhookId: this.webhook._id,
            poolId: this.pool._id,
            title: this.title,
            metadata: this.metadata,
            description: this.description,
            file: this.imageFile,
            expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
            limit: this.limit,
            pointPrice: this.pointPrice,
            isPromoted: this.isPromoted,
        });

        this.isSubmitDisabled = false;
        this.isLoading = false;
        this.$bvModal.hide(this.id);
        this.$emit('submit');
    }

    onImgChange() {
        this.image = '';
    }
}
</script>
