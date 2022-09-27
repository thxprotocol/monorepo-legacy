<template>
    <b-dropdown size="sm" variant="link" no-caret toggle-class="d-flex align-items-center float-right">
        <template #button-content>
            <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
        </template>
        <b-dropdown-item size="sm" variant="dark" @click="$emit('archive')">
            <span class="text-muted"
                ><i class="fas fa-archive mr-3"></i>
                {{ !pool.archived ? 'Archive' : 'Unarchive' }}
            </span>
        </b-dropdown-item>
        <b-dropdown-item v-clipboard:copy="pool._id">
            <span class="text-muted"><i class="fas fa-clipboard mr-3"></i>Copy ID </span>
        </b-dropdown-item>
        <b-dropdown-item size="sm" variant="dark" @click="$emit('remove')">
            <span class="text-muted"><i class="fas fa-trash-alt mr-3"></i>Remove</span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { IPool } from '@thxprotocol/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownMenuPool extends Vue {
    @Prop() pool!: IPool;
}
</script>
