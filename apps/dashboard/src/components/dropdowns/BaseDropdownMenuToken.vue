<template>
    <b-dropdown size="sm" variant="link" no-caret toggle-class="d-flex align-items-center float-right">
        <template #button-content>
            <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
        </template>
        <b-dropdown-item size="sm" variant="dark" @click.stop="$emit('archive')">
            <span class="text-muted"
                ><i class="fas fa-archive mr-3"></i>
                {{ !erc20.archived ? 'Archive' : 'Unarchive' }}
            </span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { TERC20 } from '@thxprotocol/dashboard/types/erc20';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownMenuToken extends Vue {
    @Prop() erc20!: TERC20;
}
</script>
