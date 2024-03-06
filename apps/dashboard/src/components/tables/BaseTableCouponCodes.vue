<template>
    <div>
        <b-pagination
            v-if="total"
            size="sm"
            @change="onChangePage"
            v-model="page"
            :total-rows="total"
            :per-page="limit"
        />
        <b-table striped hover :items="couponCodes" :loading="isLoading">
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
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { TCouponCodeState } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
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
            created: format(new Date(c.createdAt), 'd-M yyyy (HH:mm)'),
            id: c._id,
        }));
    }

    async mounted() {
        this.codes = [];
        if (this.reward) {
            await this.listCouponCodes();
        }
    }

    async listCouponCodes() {
        await this.$store.dispatch(`pools/listCouponCodes`, {
            pool: this.pool,
            reward: this.reward,
            page: this.page,
            limit: this.limit,
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
