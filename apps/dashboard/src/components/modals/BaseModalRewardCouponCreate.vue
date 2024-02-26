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
            <b-tab title="Coupon Codes" style="max-height: 300px; overflow-y: auto">
                <b-table v-if="reward" striped hover :items="couponCodes">
                    <template #head(code)> Code </template>
                    <template #head(created)>Created</template>
                    <template #head(id)> &nbsp; </template>

                    <template #cell(code)="{ item }">
                        <code>{{ item.code }}</code>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small>{{ item.createdAt }}</small>
                    </template>
                    <template #cell(id)="{ item }">
                        <b-dropdown variant="link" size="sm" no-caret right>
                            <template #button-content>
                                <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                            </template>
                            <b-dropdown-item @click="onClickDeleteCode(item)"> Delete </b-dropdown-item>
                        </b-dropdown>
                    </template>
                </b-table>
            </b-tab>
        </b-tabs>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import type { TPool, TCouponReward, TBaseReward } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardVariant } from '@thxnetwork/types/enums';
import { CSVParser } from '../../utils/csv';
import { format } from 'date-fns';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';

@Component({
    components: {
        BaseModalRewardCreate,
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
    @Prop({ required: false }) reward!: TCouponReward;

    get couponCodes() {
        if (!this.reward) return [];
        return this.reward.couponCodes.map((c) => ({
            code: c.code,
            created: format(new Date(c.createdAt), 'd-M yyyy (HH:mm)'),
            id: c._id,
        }));
    }

    onShow() {
        this.codes = [];
        this.fileCoupons = null;
        this.webshopURL = this.reward ? this.reward.webshopURL : this.webshopURL;
    }

    onChangeFileCoupons(file: File) {
        CSVParser.parse(file, { complete: this.onComplete, error: this.onError });
    }

    onComplete({ data, errors }: { data: string[]; errors: any[] }) {
        this.codes = data.map((code) => code[0]);
        if (errors.length) console.error(errors);
    }

    onClickDeleteCode(item: any) {
        this.$store.dispatch(`couponRewards/deleteCode`, {
            pool: this.pool,
            reward: this.reward,
            couponCodeId: item.id,
        });
    }

    async onSubmit(payload: TBaseReward) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`couponRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.Coupon,
                codes: this.codes,
                webshopURL: this.webshopURL,
            });
            this.isLoading = false;
            this.$bvModal.hide(this.id);
            this.$emit('submit');
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
