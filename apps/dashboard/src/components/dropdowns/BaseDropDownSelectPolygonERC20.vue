<template>
    <b-dropdown variant="link" class="dropdown-select">
        <template #button-content>
            <div class="d-flex align-items-center" v-if="erc20">
                <img v-if="!erc20._id" :src="erc20.logoURI" class="mr-3" width="20" :alt="erc20.name" />
                <base-identicon v-else class="mr-3" :size="20" variant="darker" :uri="erc20.logoURI" />
                <strong class="mr-1">{{ erc20.symbol }}</strong> {{ erc20.name }}
            </div>
            <div v-else>Select an ERC20 token from the list</div>
        </template>
        <b-dropdown-item-button @click="$emit('selected', null)">
            Provide your own ERC20 contract address
        </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item-button
            :key="erc20.address"
            v-for="erc20 of tokenList"
            @click="$emit('selected', erc20)"
            :disabled="chainId !== erc20.chainId"
        >
            <img :src="erc20.logoURI" width="20" class="mr-3" :alt="erc20.name" />
            <strong>{{ erc20.symbol }}</strong> {{ erc20.name }}
        </b-dropdown-item-button>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from 'axios';
import BaseIdenticon from '../BaseIdenticon.vue';
import { ChainId } from '@thxnetwork/common/enums';
import type { TERC20 } from '@thxnetwork/dashboard/types/erc20';

const QUICKSWAP_TOKEN_LIST =
    'https://unpkg.com/quickswap-default-token-list@1.2.41/build/quickswap-default.tokenlist.json';

@Component({
    components: {
        BaseIdenticon,
    },
})
export default class DropDownSelectPolygonERC20 extends Vue {
    tokenList: TERC20[] = [];

    @Prop() erc20!: TERC20;
    @Prop() chainId!: ChainId;
    @Prop() tokenAddress!: string;

    async mounted() {
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
}
</script>
