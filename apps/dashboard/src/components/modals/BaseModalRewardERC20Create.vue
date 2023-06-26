<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="perk ? 'Update Coin Reward' : 'Create Coin Reward'"
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
                            :claimAmount="claimAmount"
                            :claimLimit="claimLimit"
                            @change-reward-limit="limit = $event"
                            @change-claim-amount="onChangeClaimAmount"
                        />
                        <BaseCardTokenGating
                            class="mb-3"
                            :pool="pool"
                            :perk="perk"
                            @change-contract-address="tokenGatingContractAddress = $event"
                            @change-amount="tokenGatingAmount = $event"
                            @change-variant="tokenGatingVariant = $event"
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
                {{ perk ? 'Update Coin Reward' : 'Create Coin Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TERC20Perk, TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TokenGatingVariant } from '@thxnetwork/types/enums';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseDropdownSelectERC20 from '../dropdowns/BaseDropdownSelectERC20.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseCardTokenGating from '../cards/BaseCardTokenGating.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
        BaseDropdownSelectERC20,
        BaseCardTokenGating,
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
    tokenGatingContractAddress = '';
    tokenGatingVariant = TokenGatingVariant.ERC20;
    tokenGatingAmount = 0;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) perk!: TERC20Perk;

    onShow() {
        this.erc20Id = this.perk ? this.perk.erc20Id : this.erc20Id;
        this.title = this.perk ? this.perk.title : this.title;
        this.description = this.perk ? this.perk.description : this.description;
        this.amount = this.perk ? String(this.perk.amount) : this.amount;
        this.pointPrice = this.perk ? this.perk.pointPrice : this.pointPrice;
        this.expiryDate = this.perk ? this.perk.expiryDate : this.expiryDate;
        this.limit = this.perk ? this.perk.limit : 0;
        this.claimLimit = this.perk ? this.perk.claimLimit : 1;
        this.claimAmount = this.perk ? this.perk.claimAmount : 0;
        this.image = this.perk && this.perk.image ? this.perk.image : '';
        this.isPromoted = this.perk ? this.perk.isPromoted : this.isPromoted;
        this.tokenGatingContractAddress = this.perk
            ? this.perk.tokenGatingContractAddress
            : this.tokenGatingContractAddress;
        this.tokenGatingVariant = this.perk ? this.perk.tokenGatingVariant : this.tokenGatingVariant;
        this.tokenGatingAmount = this.perk ? this.perk.tokenGatingAmount : this.tokenGatingAmount;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`erc20Perks/${this.perk ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.perk,
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
                    tokenGatingContractAddress: this.tokenGatingContractAddress,
                    tokenGatingVariant: this.tokenGatingVariant,
                    tokenGatingAmount: this.tokenGatingAmount,
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
