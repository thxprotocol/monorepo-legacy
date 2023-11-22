<template>
    <b-dropdown size="sm" variant="link" right no-caret toggle-class="d-flex align-items-center float-right">
        <template #button-content>
            <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
        </template>
        <b-dropdown-item @click.stop="$copyText(pool._id)" link-class="text-muted small">
            <span class="d-inline-block" style="width: 30px"><i class="fas fa-clipboard mr-3"></i></span>
            <span>Copy ID</span>
        </b-dropdown-item>
        <!-- <b-dropdown-item @click.stop="onClickTransferPool" link-class="text-muted small">
            <span class="d-inline-block" style="width: 30px"><i class="fas fa-exchange-alt mr-3"></i></span>
            <span>Transfer</span>
            <BaseModalPoolTransfer :pool="pool" title="Transfer pool ownership" />
        </b-dropdown-item> -->
        <b-dropdown-item @click.stop="$emit('archive')" link-class="text-muted small">
            <span class="d-inline-block" style="width: 30px">
                <i
                    class="fas mr-3"
                    :class="{ 'fa-toggle-on': pool.settings.isArchived, 'fa-toggle-off': !pool.settings.isArchived }"
                />
            </span>
            <span>Archive</span>
            <BaseModalPoolTransfer :pool="pool" title="Transfer pool ownership" />
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item @click.stop="$emit('remove')" link-class="text-muted small">
            <span class="d-inline-block" style="width: 30px"><i class="fas fa-trash-alt mr-3"></i></span>
            <span>Remove</span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModalPoolTransfer from '../modals/BaseModalPoolTransfer.vue';

@Component({
    components: {
        BaseModalPoolTransfer,
    },
})
export default class BaseDropdownMenuPool extends Vue {
    error = '';

    @Prop() pool!: TPool;

    onClickTransferPool() {
        this.$bvModal.show(`modalPoolTransfer${this.pool._id}`);
    }
}
</script>
