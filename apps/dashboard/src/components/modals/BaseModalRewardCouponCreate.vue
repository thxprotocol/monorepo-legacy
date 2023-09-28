<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Coupon Reward'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit()" id="formRewardCouponCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Coupon Codes">
                            <b-form-file
                                v-model="fileCoupons"
                                :state="fileCoupons"
                                placeholder="Choose a file or drop it here..."
                                drop-placeholder="Drop file here..."
                            ></b-form-file>
                            <small class="mt-3 text-muted">
                                Selected file: {{ fileCoupons ? fileCoupons.name : '' }}
                            </small>
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
                        <BaseCardTokenGating
                            class="mb-3"
                            :pool="pool"
                            :perk="reward"
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
                form="formRewardCustomCreate"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' Custom Reward' }}
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
import BaseCardTokenGating from '../cards/BaseCardTokenGating.vue';
import { TokenGatingVariant, RewardVariant } from '@thxnetwork/types/enums';
import type { TCustomReward, TAccount, TPool } from '@thxnetwork/types/interfaces';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
        BaseCardTokenGating,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class ModalRewardCustomCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;

    pools!: IPools;
    profile!: TAccount;

    fileCoupons: File | null = null;
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
    tokenGatingVariant = TokenGatingVariant.ERC721;
    tokenGatingContractAddress = '';
    tokenGatingAmount = 0;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TCustomReward;

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.pointPrice = this.reward ? this.reward.pointPrice : 0;
        this.expiryDate = this.reward ? this.reward.expiryDate : null;
        this.limit = this.reward ? this.reward.limit : 0;
        this.claimAmount = this.reward ? this.reward.claimAmount : this.claimAmount;
        this.claimLimit = this.reward ? this.reward.claimLimit : this.claimLimit;
        this.image = this.reward ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : false;
        this.tokenGatingContractAddress = this.reward
            ? this.reward.tokenGatingContractAddress
            : this.tokenGatingContractAddress;
        this.tokenGatingVariant = this.reward ? this.reward.tokenGatingVariant : this.tokenGatingVariant;
        this.tokenGatingAmount = this.reward ? this.reward.tokenGatingAmount : this.tokenGatingAmount;
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

    onSubmit() {
        this.isLoading = true;
        this.isSubmitDisabled = true;

        const payload = {
            ...this.reward,
            variant: RewardVariant.Coupon,
            poolId: this.pool._id,
            title: this.title,
            description: this.description,
            file: this.imageFile,
            expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
            limit: this.limit,
            pointPrice: this.pointPrice,
            isPromoted: this.isPromoted,
            tokenGatingContractAddress: this.tokenGatingContractAddress,
            tokenGatingVariant: this.tokenGatingVariant,
            tokenGatingAmount: this.tokenGatingAmount,
        };

        this.$store.dispatch(`rewards/${this.reward ? 'update' : 'create'}`, payload).then(() => {
            this.isSubmitDisabled = false;
            this.isLoading = false;
            this.$bvModal.hide(this.id);
            this.$emit('submit');
        });
    }

    onImgChange() {
        this.image = '';
    }
}
</script>
