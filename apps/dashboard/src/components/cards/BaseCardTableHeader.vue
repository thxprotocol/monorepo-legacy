<template>
    <div class="table-header p-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center" v-if="isPublishFilterShown">
            <b-button
                :variant="published ? 'primary' : 'link'"
                @click="$emit('click-published', true)"
                class="rounded-pill py-2"
            >
                Published
            </b-button>
            <b-button
                :variant="!published ? 'primary' : 'link'"
                @click="$emit('click-published', false)"
                class="rounded-pill py-2"
            >
                Unpublished
            </b-button>
        </div>
        <div class="d-flex align-items-center">
            <span class="text-muted mr-2" v-if="selectedItems.length">
                Selected <strong>{{ selectedItems.length }}</strong> item{{ selectedItems.length === 1 ? '' : 's' }}
            </span>
            <b-dropdown
                v-if="actions.length && selectedItems.length"
                variant="dark"
                size="sm"
                split
                class="mr-5"
                :text="selectedBulkAction ? selectedBulkAction.label : ''"
                :disabled="!selectedItems.length"
                @click="selectedBulkAction ? onClickAction(selectedBulkAction) : null"
            >
                <b-dropdown-item
                    :disabled="!selectedItems.length"
                    class="small"
                    @click="onClickAction(item)"
                    :key="key"
                    v-for="(item, key) of actions"
                >
                    {{ item.label }}
                </b-dropdown-item>
            </b-dropdown>
        </div>
        <div class="d-flex align-items-center">
            <b-input-group size="sm" class="mr-5" v-if="search">
                <template #prepend>
                    <b-input-group-text><i class="fas fa-search"></i></b-input-group-text>
                </template>
                <b-form-input size="sm" placeholder="Search..." @input="$emit('input-query', $event)" />
            </b-input-group>
            <div class="d-flex align-items-center mr-5" v-if="toggleLabel">
                <span class="text-muted mr-2">{{ toggleLabel }}</span>
                <b-form-checkbox :checked="true" @change="$emit('toggle', $event)" />
            </div>
            <span class="text-muted mr-2">Limit</span>
            <b-form-select
                @change="$emit('change-limit', $event)"
                style="max-width: 75px"
                size="sm"
                :value="limit"
                :options="[10, 25, 50, 100, 500, 1000, 5000]"
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
import { type TPool } from '@thxnetwork/types/interfaces';
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
    @Prop() sorts!: { value: string; text: string }[];
    @Prop() pool!: TPool;
    @Prop() totalRows!: number;
    @Prop() search!: boolean;
    @Prop() toggleLabel!: string;
    @Prop() published!: boolean;

    selectedBulkAction: TTableBulkAction | null = null;

    get isPublishFilterShown() {
        return typeof this.published !== 'undefined';
    }

    mounted() {
        this.selectedBulkAction = this.actions[0];
    }

    onClickAction(item: TTableBulkAction) {
        this.selectedBulkAction = item;
        this.$emit('click-action', item);
    }
}
</script>
<style>
.table thead th {
    border-width: 1px;
}
</style>
