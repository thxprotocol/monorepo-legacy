<template>
    <BaseModalRewardCreate
        @show="onShow"
        @submit="onSubmit"
        :pool="pool"
        :id="id"
        :reward="reward"
        :error="error"
        :is-loading="isLoading"
    >
        <b-form-group label="Webshop URL">
            <b-form-input v-model="webshopURL" />
        </b-form-group>
        <b-tabs small justified content-class="py-3">
            <b-tab title="Upload">
                <b-form-group label="Coupon Codes">
                    <b-form-file
                        v-model="fileCoupons"
                        @input="onChangeFileCoupons"
                        placeholder="Choose a file or drop it here..."
                        drop-placeholder="Drop file here..."
                        accept=".csv"
                    ></b-form-file>
                    <small class="mt-3 text-muted" v-if="fileCoupons">
                        Selected file: {{ fileCoupons ? fileCoupons.name : '' }}
                        <code v-if="codes.length"> ({{ codes.length }} codes: {{ codes[0] }} and more...) </code>
                    </small>
                </b-form-group>
            </b-tab>
            <b-tab title="Coupon Codes">
                <BaseTableCouponCodes :reward="reward" :pool="pool" />
            </b-tab>
        </b-tabs>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardVariant } from '@thxnetwork/common/enums';
import { CSVParser } from '../../utils/csv';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';
import BaseTableCouponCodes from '../tables/BaseTableCouponCodes.vue';

@Component({
    components: {
        BaseModalRewardCreate,
        BaseTableCouponCodes,
    },
})
export default class ModalRewardCustomCreate extends Vue {
    isLoading = false;
    error = '';

    fileCoupons: File | null = null;
    codes: string[] = [];
    webshopURL = '';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TRewardCoupon;

    onShow() {
        this.codes = [];
        this.fileCoupons = null;
        this.webshopURL = this.reward ? this.reward.webshopURL : this.webshopURL;
    }

    onChangeFileCoupons(file: File) {
        CSVParser.parse(file, { complete: this.onComplete, error: console.error });
    }

    onComplete({ data, errors }: { data: string[]; errors: any[] }) {
        this.codes = data.map((code) => code[0]);
        if (errors.length) console.error(errors);
    }

    async onSubmit(payload: TReward) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.reward ? 'update' : 'create'}Reward`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.Coupon,
                codes: this.codes,
                webshopURL: this.webshopURL && this.webshopURL,
            });
            this.isLoading = false;
            this.$emit('submit', { isPublished: payload.isPublished });
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
