<template>
    <base-modal size="xl" title="Create Dailys Reward" :id="id" :error="error" :loading="isLoading" @show="onShow">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">Dailys rewards are distributed to your customers every 24 hours</p>
            <form v-on:submit.prevent="onSubmit()" id="formRewardDailysCreate">
                <b-row>
                    <b-col>
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input v-model="amount" />
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
                form="formRewardDailysCreate"
                variant="primary"
                block
            >
                {{ reward ? 'Update Daily Reward' : 'Create Daily Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TDailyReward } from '@thxnetwork/types/interfaces/DailyReward';
import BaseModal from './BaseModal.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BaseModal,
        BaseCardRewardQRCodes,
    },
    computed: mapGetters({
        totals: 'dailyRewards/totals',
    }),
})
export default class ModalRewardDailysCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = '0';
    description = '';
    rewardLimit = 0;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TDailyReward;

    onShow() {
        if (this.reward) {
            this.title = this.reward.title;
            this.description = this.reward.description;
            this.amount = this.reward.amount;
            this.rewardLimit = this.reward.rewardLimit;
        } else {
            this.title = '';
            this.description = '';
            this.amount = '0';
            this.rewardLimit = 0;
        }
    }

    setValues(reward?: TDailyReward) {
        if (!reward) return;
    }

    onSubmit() {
        const payload = {
            ...this.reward,
            _id: this.reward ? this.reward._id : undefined,
            poolId: this.pool._id,
            title: this.title,
            description: this.description,
            amount: this.amount,
            rewardLimit: this.rewardLimit,
            page: this.reward ? this.reward.page : 1,
        };
        console.log('payload', payload);
        this.isLoading = true;
        this.$store.dispatch(`dailyRewards/${this.reward ? 'update' : 'create'}`, payload).then(() => {
            this.$bvModal.hide(this.id);
            this.$emit('submit');
            this.isLoading = false;
        });
    }
}
</script>
