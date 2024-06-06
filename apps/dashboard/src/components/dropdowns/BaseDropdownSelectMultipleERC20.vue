<template>
    <div>
        <b-dropdown variant="link" class="dropdown-select mb-2">
            <template #button-content> Select the coins you want to support </template>
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
                :disabled="chainId !== ChainId.Polygon"
                :key="erc20.address"
                v-for="erc20 of tokenList"
                @click="onTokenListItemClick(erc20)"
            >
                <img :src="erc20.logoURI" width="20" class="mr-3" :alt="erc20.name" />
                <strong>{{ erc20.symbol }}</strong> {{ erc20.name }}
            </b-dropdown-item-button>
        </b-dropdown>
        <div v-if="erc20Tokens.length" class="d-flex flex-wrap">
            <b-badge
                variant="dark"
                class="d-inline-flex align-items-center mr-1 mb-1"
                :key="key"
                v-for="(erc20Token, key) of erc20Tokens"
                v-b-tooltip
                :title="erc20Token.address"
            >
                <img
                    v-if="!erc20Token._id"
                    :src="erc20Token.logoURI"
                    class="d-flex align-items-center justify-content-center overflow-hidden mr-1"
                    height="20"
                    :alt="erc20Token.name"
                />
                <base-identicon v-else class="mr-1" :size="20" :uri="erc20Token.logoURI" />
                <strong class="mr-1">{{ erc20Token.symbol }}</strong>
                <b-button
                    size="sm"
                    variant="link"
                    class="text-white ml-1 close"
                    @click="onTokenListItemClick(erc20Token)"
                    >×</b-button
                >
            </b-badge>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import axios from 'axios';
import { IERC20s, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import BaseIdenticon from '../BaseIdenticon.vue';
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import { ChainId } from '@thxnetwork/common/enums';

const QUICKSWAP_TOKEN_LIST =
    'https://unpkg.com/quickswap-default-token-list@1.2.36/build/quickswap-default.tokenlist.json';

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
    erc20Tokens: TERC20[] = [];
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
                    if (!this.erc20Tokens.length) {
                        this.erc20Tokens = [this.erc20s[id]] as TERC20[];
                        this.$emit('selected', this.erc20Tokens);
                    }
                });
            }
        });

        this.tokenList = await this.getLatestTokenList();
    }

    async getLatestTokenList() {
        const r = await axios({
            method: 'GET',
            url: QUICKSWAP_TOKEN_LIST,
            withCredentials: false,
        });

        return r.data.tokens;
    }

    onTokenListItemClick(erc20: TERC20) {
        const index = this.erc20Tokens.indexOf(erc20);

        if (index > -1) {
            this.erc20Tokens.splice(index, 1);
        } else {
            this.erc20Tokens.push(erc20);
            this.$emit('selected', this.erc20Tokens);
        }
    }
}
</script>
