<template>
    <div>
        <b-form-group>
            <label>Blockchain Network</label>
            <b-dropdown variant="link" class="dropdown-select" :toggle-class="{ disabled: disabled }">
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
import type { IAccount } from '@thxnetwork/dashboard/types/account';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { PUBLIC_URL } from '@thxnetwork/dashboard/utils/secrets';
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
    profile!: IAccount;
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
