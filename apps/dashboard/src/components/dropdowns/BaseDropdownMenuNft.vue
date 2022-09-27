<template>
    <b-dropdown size="sm" variant="link" no-caret toggle-class="d-flex align-items-center float-right">
        <template #button-content>
            <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
        </template>
        <b-dropdown-item size="sm" variant="dark" @click.stop="$emit('archive')">
            <span class="text-muted"
                ><i class="fas fa-archive mr-3"></i>
                {{ !erc721.archived ? 'Archive' : 'Unarchive' }}
            </span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownMenuNft extends Vue {
    @Prop() erc721!: TERC721;
}
</script>
