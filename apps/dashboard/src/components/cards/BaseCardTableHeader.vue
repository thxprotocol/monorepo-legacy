<template>
    <div class="p-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
            <span class="text-muted mr-2">
                Selected <strong>{{ selectedItems.length }}</strong> item{{ selectedItems.length === 1 ? '' : 's' }}
            </span>
            <b-dropdown
                @click="onClickBulkAction"
                variant="dark"
                size="sm"
                split
                :text="selectedBulkAction.label"
                class="mr-5"
            >
                <b-dropdown-item
                    class="small"
                    @click="selectedBulkAction = item"
                    :key="key"
                    v-for="(item, key) of [
                        { variant: 0, label: 'Download QR codes' },
                        { variant: 1, label: 'Download CSV' },
                        { variant: 2, label: `Delete ${selectedItems.length} rewards` },
                    ]"
                >
                    {{ item.label }}
                </b-dropdown-item>
            </b-dropdown>
            <BaseModalRewardClaimsDownload
                :id="`modalRewardClaimsDownload`"
                :pool="pool"
                :rewards="rewards"
                :selectedItems="selectedItems"
            />
        </div>
        <div class="d-flex align-items-center">
            <span class="text-muted mr-2">Limit</span>
            <b-form-select
                @change="$emit('change-limit', $event)"
                style="max-width: 75px"
                size="sm"
                :value="limit"
                :options="[5, 10, 25, 50, 100]"
                class="mr-5"
            />

            <b-pagination
                size="sm"
                class="my-0"
                @change="$emit('change-page', $event)"
                v-model="page"
                :per-page="limit"
                :total-rows="total"
                align="center"
            ></b-pagination>
        </div>
    </div>
</template>

<script lang="ts">
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { type TBaseReward } from '@thxnetwork/types/index';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModalRewardClaimsDownload from '../modals/BaseModalRewardClaimsDownload.vue';

@Component({
    components: {
        BaseModalRewardClaimsDownload,
    },
})
export default class BaseCardTableHeader extends Vue {
    selectedBulkAction = { variant: 0, label: 'Download QR codes' };

    @Prop() totals!: { [poolId: string]: number };
    @Prop() selectedItems!: string[];
    @Prop() rewards!: { [poolId: string]: { [id: string]: TBaseReward } };
    @Prop() page!: number;
    @Prop() limit!: number;
    @Prop() pool!: IPool;

    get total() {
        return this.totals[this.$route.params.id];
    }

    onClickBulkAction() {
        switch (this.selectedBulkAction.variant) {
            case 0:
                this.$bvModal.show('modalRewardClaimsDownload');
                break;
        }
    }
}
</script>
