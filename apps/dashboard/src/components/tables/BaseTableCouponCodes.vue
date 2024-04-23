<template>
    <b-card no-body header-class="d-flex">
        <template #header>
            <b-form-input size="sm" v-model="query" @input="onInputSearch" placeholder="Search code" />
            <b-pagination
                class="ml-3 mb-0"
                v-if="total"
                size="sm"
                @change="onChangePage"
                v-model="page"
                :total-rows="total"
                :per-page="limit"
            />
        </template>
        <div style="max-height: 300px; overflow-y: auto">
            <b-table class="table-coupons" striped hover :items="couponCodes" :loading="isLoading">
                <template #head(code)> Code </template>
                <template #head(id)> &nbsp; </template>
                <template #cell(account)="{ item }">
                    <BaseParticipantAccount :account="item.account" v-if="item.account" />
                </template>
                <template #cell(code)="{ item }">
                    <code>{{ item.code }}</code>
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
        </div>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TCouponCodeState } from '@thxnetwork/dashboard/store/modules/pools';
import BaseParticipantAccount from '../BaseParticipantAccount.vue';

@Component({
    components: {
        BaseParticipantAccount,
    },
    computed: mapGetters({
        couponCodeList: 'pools/couponCodes',
    }),
})
export default class ModalRewardCustomCreate extends Vue {
    isLoading = false;
    error = '';
    codes: string[] = [];
    page = 1;
    limit = 10;
    query = '';

    couponCodeList!: TCouponCodeState;

    @Prop() pool!: TPool;
    @Prop({ required: true }) reward!: TRewardCoupon;

    get total() {
        if (!this.reward || !this.couponCodeList[this.pool._id] || !this.couponCodeList[this.pool._id][this.reward._id])
            return 0;
        return this.couponCodeList[this.pool._id][this.reward._id].total;
    }

    get couponCodes() {
        if (!this.couponCodeList[this.pool._id] || !this.couponCodeList[this.pool._id][this.reward._id]) return [];
        return this.couponCodeList[this.pool._id][this.reward._id].results.map((c) => ({
            code: c.code,
            account: c.account,
            id: c._id,
        }));
    }

    async mounted() {
        this.codes = [];
        if (this.reward) {
            await this.listCouponCodes();
        }
    }

    async onInputSearch() {
        this.page = 1;
        await this.listCouponCodes();
    }

    async listCouponCodes() {
        await this.$store.dispatch(`pools/listCouponCodes`, {
            pool: this.pool,
            reward: this.reward,
            page: this.page,
            limit: this.limit,
            query: this.query,
        });
    }

    onChangePage() {
        this.listCouponCodes();
    }

    onClickDeleteCode(item: any) {
        this.$store.dispatch(`pools/deleteCouponCode`, {
            reward: this.reward,
            couponCodeId: item.id,
        });
    }
}
</script>
<style lang="scss">
.table-coupons {
    td:nth-child(2) {
        width: 200px;
        overlfow: scroll;
    }
    td:nth-child(2) {
        width: 100px;
    }
}
</style>
