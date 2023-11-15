<template>
    <div>
        <b-form-group>
            <label>Blockchain Network</label>
            <b-dropdown
                variant="light"
                :toggle-class="{
                    'disabled': disabled,
                    'form-control d-flex align-items-center justify-content-between': true,
                }"
                menu-class="w-100"
                class="w-100"
            >
                <template #button-content>
                    <div class="d-flex align-items-center">
                        <img :src="chainInfo[currentChainId].logo" width="20" height="20" class="mr-3" />
                        {{ chainInfo[currentChainId].name }}
                    </div>
                </template>
                <b-dropdown-item-button
                    :disabled="n.disabled"
                    @click="onSelectNetwork(n.chainId)"
                    :key="key"
                    v-for="(n, key) of chainInfo"
                >
                    <img :src="n.logo" width="20" height="20" class="mr-3" />
                    <span>{{ n.name }}</span>
                </b-dropdown-item-button>
            </b-dropdown>
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import type { TAccount } from '@thxnetwork/types/interfaces';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { PUBLIC_URL } from '@thxnetwork/dashboard/config/secrets';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseFormSelectNetwork extends Vue {
    @Prop() chainId!: ChainId;
    @Prop() disabled!: boolean;

    ChainId = ChainId;
    publicUrl = PUBLIC_URL;
    chainInfo = chainInfo;
    profile!: TAccount;
    currentChainId = ChainId.Polygon;

    created() {
        if (this.chainId) this.currentChainId = this.chainId;
        this.$emit('selected', this.currentChainId);
    }

    onSelectNetwork(chainId: ChainId) {
        this.currentChainId = chainId;
        this.$emit('selected', chainId);
    }
}
</script>
