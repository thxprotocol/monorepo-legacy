<template>
    <b-dropdown variant="link" class="dropdown-select">
        <template #button-content>
            <div v-if="selectedERC721Token" class="d-flex align-items-center" style="height: 32px">
                <span class="d-none d-md-block text-muted"> # {{ selectedERC721Token.tokenId }} </span>
            </div>
        </template>
        <b-dropdown-item-btn
            v-for="token in tokens"
            :key="token._id"
            @click="onTokenSelected(token)"
            button-class="d-flex justify-content-between"
        >
            <div class="flex-grow"># {{ token.tokenId }}</div>
        </b-dropdown-item-btn>
    </b-dropdown>
</template>
<script lang="ts">
import type { IERC721Tokens, TERC721Token } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownERC721ImportedToken extends Vue {
    @Prop() erc721Id!: string;
    @Prop({ required: false }) erc721tokenId!: string;
    @Prop() pool!: TPool;
    @Prop() erc721Tokens!: IERC721Tokens;

    selectedERC721Token: TERC721Token | null = null;

    get tokens() {
        if (!this.erc721Tokens[this.erc721Id]) {
            return [] as TERC721Token[];
        }
        return Object.keys(this.erc721Tokens[this.erc721Id]).map((key) => {
            return this.erc721Tokens[this.erc721Id][key] as TERC721Token;
        });
    }

    mounted() {
        if (this.erc721tokenId) {
            this.selectedERC721Token = this.erc721Tokens[this.erc721Id][this.erc721tokenId] as TERC721Token;
        }
    }

    onTokenSelected(token: TERC721Token) {
        this.selectedERC721Token = token;
        this.$emit('selected', token);
    }
}
</script>
