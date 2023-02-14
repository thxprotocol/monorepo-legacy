<template>
    <b-dropdown size="sm" variant="link" right no-caret toggle-class="d-flex align-items-center float-right">
        <template #button-content>
            <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
        </template>
        <b-dropdown-item @click.stop="$emit('edit')">
            <span class="text-muted"><i class="fas fa-pen mr-3"></i>Edit </span>
        </b-dropdown-item>
        <b-dropdown-item size="sm" variant="dark" @click.stop="$emit('archive')">
            <span class="text-muted"
                ><i class="fas fa-archive mr-2"></i>
                {{ !pool.archived ? 'Archive' : 'Unarchive' }}
            </span>
        </b-dropdown-item>
        <b-dropdown-item @click.stop="$copyText(pool._id)">
            <span class="text-muted"><i class="fas fa-clipboard mr-3"></i>Copy ID </span>
        </b-dropdown-item>
        <b-dropdown-item @click.stop="onClickTransferPool">
            <span class="text-muted"><i class="fas fa-exchange-alt mr-3"></i>Transfer </span>
            <BaseModalPoolTransfer :pool="pool" title="Transfer pool ownership" />
        </b-dropdown-item>
        <b-dropdown-item size="sm" variant="dark" @click.stop="$emit('remove')">
            <span class="text-muted"><i class="fas fa-trash-alt mr-3"></i>Remove</span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModalPoolTransfer from '../modals/BaseModalPoolTransfer.vue';

@Component({
    components: {
        BaseModalPoolTransfer,
    },
})
export default class BaseDropdownMenuPool extends Vue {
    error = '';

    @Prop() pool!: IPool;

    onClickTransferPool() {
        this.$bvModal.show(`modalPoolTransfer${this.pool._id}`);
    }
}
</script>
