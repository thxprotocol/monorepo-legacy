<template>
    <div class="p-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
            <span class="text-muted mr-2">
                Selected <strong>{{ selectedItems.length }}</strong> item{{ selectedItems.length === 1 ? '' : 's' }}
            </span>
            <b-dropdown
                variant="dark"
                size="sm"
                split
                class="mr-5"
                :text="selectedBulkAction ? selectedBulkAction.label : ''"
                :disabled="!selectedItems.length"
                @click="selectedBulkAction ? onClickAction(selectedBulkAction) : null"
            >
                <b-dropdown-item class="small" @click="onClickAction(item)" :key="key" v-for="(item, key) of actions">
                    {{ item.label }}
                </b-dropdown-item>
            </b-dropdown>
        </div>
        <div class="d-flex align-items-center">
            <span class="text-muted mr-2">Limit</span>
            <b-form-select
                @change="$emit('change-limit', $event)"
                style="max-width: 75px"
                size="sm"
                :value="limit"
                :options="[5, 10, 25, 50, 100, 500]"
                class="mr-5"
            />

            <b-pagination
                size="sm"
                class="my-0"
                @change="$emit('change-page', $event)"
                v-model="page"
                :per-page="limit"
                :total-rows="totalRows"
                align="center"
            ></b-pagination>
        </div>
    </div>
</template>

<script lang="ts">
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModalRewardClaimsDownload from '../modals/BaseModalRewardClaimsDownload.vue';

export type TTableBulkAction = { variant: number; label: string };

@Component({
    components: {
        BaseModalRewardClaimsDownload,
    },
})
export default class BaseCardTableHeader extends Vue {
    @Prop() totals!: { [poolId: string]: number };
    @Prop() selectedItems!: string[];
    @Prop() actions!: TTableBulkAction[];
    @Prop() page!: number;
    @Prop() limit!: number;
    @Prop() pool!: IPool;
    @Prop() totalRows!: number;

    selectedBulkAction: TTableBulkAction | null = null;

    mounted() {
        this.selectedBulkAction = this.actions[0];
    }

    onClickAction(item: TTableBulkAction) {
        this.selectedBulkAction = item;
        this.$emit('click-action', item);
    }
}
</script>
