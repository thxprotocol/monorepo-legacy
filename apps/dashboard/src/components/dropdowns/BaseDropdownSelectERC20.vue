<template>
    <b-dropdown variant="link" class="dropdown-select" v-if="tokenList.length">
        <template #button-content>
            <div v-if="erc20Token && erc20Token.chainId === chainId">
                <div class="d-flex align-items-center">
                    <img
                        v-if="!erc20Token._id"
                        :src="erc20Token.logoURI"
                        class="mr-3"
                        width="20"
                        :alt="erc20Token.name"
                    />
                    <base-identicon v-else class="mr-3" :size="20" variant="darker" :uri="erc20Token.logoURI" />
                    <strong class="mr-1">{{ erc20Token.symbol }}</strong>
                    {{ erc20Token.name }}
                </div>
            </div>
            <div v-else>Select an ERC20 token</div>
        </template>
        <b-dropdown-item-button @click="onTokenListItemClick(null)"> None </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item v-if="!hasERC20s"> No tokens available. </b-dropdown-item>
        <b-dropdown-item-button
            :disabled="chainId !== erc20.chainId"
            :key="erc20._id"
            v-for="erc20 of erc20s"
            @click="onTokenListItemClick(erc20)"
        >
            <div class="d-flex align-items-center">
                <base-identicon class="mr-3" size="20" variant="darker" :uri="erc20.logoURI" />
                <strong class="mr-1">{{ erc20.symbol }}</strong> {{ erc20.name }}
            </div>
        </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item-button
            :key="erc20.address"
            v-for="erc20 of tokenList"
            :disabled="chainId !== ChainId.Polygon"
            @click="onTokenListItemClick(erc20)"
        >
            <img :src="erc20.logoURI" width="20" class="mr-3" :alt="erc20.name" />
            <strong>{{ erc20.symbol }}</strong> {{ erc20.name }}
        </b-dropdown-item-button>
    </b-dropdown>
    <div v-else class="small">No Token contracts available</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import axios from 'axios';
import { IERC20s, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import BaseIdenticon from '../BaseIdenticon.vue';
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';

const QUICKSWAP_TOKEN_LIST =
    'https://unpkg.com/quickswap-default-token-list@1.2.40/build/quickswap-default.tokenlist.json';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        erc20s: 'erc20/all',
        erc721s: 'erc721/all',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    ChainId = ChainId;
    erc20Token: TERC20 | null = null;
    tokenList: TERC20[] = [];

    erc20s!: IERC20s;
    erc721s!: IERC721s;

    @Prop() chainId!: ChainId;

    get hasERC20s() {
        return !!Object.values(this.erc20s).length;
    }

    async mounted() {
        this.$store.dispatch('erc20/list').then(() => {
            for (const id in this.erc20s) {
                this.$store.dispatch('erc20/read', id).then(() => {
                    const erc20 = this.erc20s[id] as TERC20;
                    if (!this.erc20Token && erc20.chainId == this.chainId) {
                        this.erc20Token = erc20;
                        this.$emit('selected', this.erc20Token);
                    }
                });
            }
        });

        const { tokens } = await this.getLatestTokenList();

        this.tokenList = tokens;
    }

    async getLatestTokenList() {
        const r = await axios({
            method: 'GET',
            url: QUICKSWAP_TOKEN_LIST,
            withCredentials: false,
        });

        return r.data;
    }

    onTokenListItemClick(erc20: TERC20 | null) {
        this.erc20Token = erc20;
        debugger;
        this.$emit('selected', this.erc20Token);
    }
}
</script>
