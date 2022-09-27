<template>
    <div>
        <b-form-group>
            <label>Blockchain Network</label>
            <b-dropdown variant="link" class="dropdown-select">
                <template #button-content>
                    <div class="d-flex align-items-center">
                        <img :src="chainInfo[chainId].logo" width="20" height="20" class="mr-3" />
                        {{ chainInfo[chainId].name }}
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
        <b-alert :show="profile.plan === AccountPlanType.Free && chainId == ChainId.Polygon" variant="warning">
            <i class="fas fa-rocket mr-2"></i>
            Choosing <strong>Polygon</strong> will move you from a Free to
            <b-link :href="publicUrl + '/pricing'">Basic</b-link> plan and start invoicing.
        </b-alert>
    </div>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { AccountPlanType, IAccount } from '@thxnetwork/dashboard/types/account';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { PUBLIC_URL } from '@thxnetwork/dashboard/utils/secrets';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseFormSelectNetwork extends Vue {
    ChainId = ChainId;
    AccountPlanType = AccountPlanType;
    publicUrl = PUBLIC_URL;
    chainInfo = chainInfo;
    chainId = ChainId.PolygonMumbai;
    profile!: IAccount;

    mounted() {
        if (this.profile.plan !== AccountPlanType.Free) this.chainId = ChainId.Polygon;
        if (process.env.NODE_ENV !== 'production') this.chainId = ChainId.Hardhat;

        this.$emit('selected', this.chainId);
    }

    onSelectNetwork(chainId: ChainId) {
        this.chainId = chainId;
        this.$emit('selected', this.chainId);
    }
}
</script>
