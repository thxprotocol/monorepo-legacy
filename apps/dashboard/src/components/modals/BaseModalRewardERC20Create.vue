<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="reward ? 'Update Coin Reward' : 'Create Coin Reward'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">
                Points rewards are distributed to your customers achieving milestones in your customer journey.
            </p>
            <form v-on:submit.prevent="onSubmit" id="formRewardPointsCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
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
                        <b-form-group label="Coin">
                            <BaseDropdownSelectERC20 @selected="erc20Id = $event._id" :chainId="pool.chainId" />
                        </b-form-group>
                        <b-row>
                            <b-col md="6">
                                <b-form-group label="Coin Amount">
                                    <b-form-input v-model="amount" />
                                </b-form-group>
                            </b-col>
                            <b-col md="6">
                                <b-form-group label="Point Price">
                                    <b-form-input type="number" :value="pointPrice" @input="onChangePointPrice" />
                                </b-form-group>
                            </b-col>
                        </b-row>
                    </b-col>
                    <b-col md="6">
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits
                            class="mb-3"
                            :limit="limit"
                            :claimLimit="claimLimit"
                            @change-reward-limit="limit = $event"
                        />
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
                form="formRewardPointsCreate"
                variant="primary"
                block
            >
                {{ reward ? 'Update Coin Reward' : 'Create Coin Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TERC20Perk, TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseDropdownSelectERC20 from '../dropdowns/BaseDropdownSelectERC20.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
        BaseDropdownSelectERC20,
    },
})
export default class ModalRewardERC20Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    erc20Id = '';
    title = '';
    amount = '0';
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
    @Prop({ required: false }) reward!: TERC20Perk;

    onShow() {
        this.erc20Id = this.reward ? this.reward.erc20Id : this.erc20Id;
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? String(this.reward.amount) : this.amount;
        this.pointPrice = this.reward ? this.reward.pointPrice : this.pointPrice;
        this.expiryDate = this.reward ? this.reward.expiryDate : this.expiryDate;
        this.limit = this.reward ? this.reward.limit : 0;
        this.claimLimit = this.reward ? this.reward.claimLimit : 1;
        this.claimAmount = this.reward ? this.reward.claimAmount : 0;
        this.image = this.reward && this.reward.image ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : this.isPromoted;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`erc20Perks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    page: 1,
                    poolId: String(this.pool._id),
                    erc20Id: this.erc20Id,
                    title: this.title,
                    description: this.description,
                    amount: this.amount,
                    pointPrice: this.pointPrice,
                    claimAmount: Number(this.claimAmount),
                    claimLimit: this.claimLimit,
                    expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
                    limit: this.limit,
                    file: this.imageFile,
                    isPromoted: this.isPromoted,
                },
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
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

    onImgChange() {
        this.image = '';
    }
}
</script>
