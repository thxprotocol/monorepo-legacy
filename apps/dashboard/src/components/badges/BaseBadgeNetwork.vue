<template>
    <b-badge
        v-if="chainInfo"
        v-b-tooltip
        :title="version"
        class="p-2 text-white d-flex align-items-center"
        variant="dark"
    >
        <img :src="chainInfo.logo" class="mr-1" width="auto" height="12" />
        {{ chainInfo.name }}
    </b-badge>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { ChainInfo } from '@thxnetwork/dashboard/types/ChainInfo';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseBadgeNetwork extends Vue {
    chainInfo: ChainInfo | null = null;

    @Prop() chainId!: ChainId;
    @Prop() version!: string;

    mounted() {
        this.chainInfo = chainInfo[this.chainId];
    }
}
</script>
