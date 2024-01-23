<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Coupon Reward'"
        :id="id"
        :error="error"
    >
        <template #modal-body>
            <b-tabs content-class="mt-3">
                <b-tab title="Reward">
                    <form v-on:submit.prevent="onSubmit" id="formRewardCouponCreate">
                        <b-row>
                            <b-col md="6">
                                <b-form-group label="Title">
                                    <b-form-input v-model="title" />
                                </b-form-group>
                                <b-form-group label="Description">
                                    <b-textarea v-model="description" />
                                </b-form-group>
                                <b-form-group label="Webshop URL">
                                    <b-form-input v-model="webshopURL" />
                                </b-form-group>
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
                                        <code v-if="codes.length">
                                            ({{ codes.length }} codes: {{ codes[0] }} and more...)
                                        </code>
                                    </small>
                                </b-form-group>
                                <b-form-group label="Point Price">
                                    <b-form-input type="number" :value="pointPrice" @input="onChangePointPrice" />
                                </b-form-group>
                                <b-form-group label="Image">
                                    <b-input-group>
                                        <template #prepend v-if="image">
                                            <div class="mr-2 bg-light p-2 border-radius-1">
                                                <img :src="image" height="35" width="auto" alt="Reward image" />
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
                                <b-form-group>
                                    <b-form-checkbox v-model="isPromoted">Promoted</b-form-checkbox>
                                </b-form-group>
                            </b-col>
                        </b-row>
                    </form>
                </b-tab>
                <b-tab title="Coupon Codes">
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
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardCouponCreate"
                variant="primary"
                block
            >
                <b-spinner small v-if="isLoading" />
                <template v-else>
                    {{ (reward ? 'Update' : 'Create') + ' Coupon Reward' }}
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
import { RewardVariant } from '@thxnetwork/types/enums';
import type { TAccount, TPool, TCouponReward } from '@thxnetwork/types/interfaces';
import { CSVParser } from '../../utils/csv';
import { format } from 'date-fns';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class ModalRewardCustomCreate extends Vue {
    isLoading = false;

    pools!: IPools;
    profile!: TAccount;

    fileCoupons: File | null = null;
    error = '';
    title = '';
    description = '';
    expiryDate: Date | null = null;
    codes: string[] = [];
    limit = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    webshopURL = '';
    isPromoted = false;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TCouponReward;

    get isSubmitDisabled() {
        return this.isLoading;
    }

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

        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.pointPrice = this.reward ? this.reward.pointPrice : this.pointPrice;
        this.webshopURL = this.reward ? this.reward.webshopURL : this.webshopURL;
        this.expiryDate = this.reward ? this.reward.expiryDate : this.expiryDate;
        this.image = this.reward ? this.reward.image : this.image;
        this.isPromoted = this.reward ? this.reward.isPromoted : this.isPromoted;
    }

    onChangePointPrice(price: number) {
        this.pointPrice = price;
    }

    async onSubmit() {
        this.isLoading = true;
        await this.$store.dispatch(`couponRewards/${this.reward ? 'update' : 'create'}`, {
            ...this.reward,
            variant: RewardVariant.Coupon,
            poolId: this.pool._id,
            title: this.title,
            description: this.description,
            file: this.imageFile,
            expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
            codes: this.codes,
            webshopURL: this.webshopURL,
            pointPrice: this.pointPrice,
            isPromoted: this.isPromoted,
        });
        this.isLoading = false;
        this.$bvModal.hide(this.id);
        this.$emit('submit');
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

    onError(error) {
        console.error(error);
    }

    onImgChange() {
        this.image = '';
    }
}
</script>
