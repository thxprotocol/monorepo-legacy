<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-token-gating
        >
            <strong>Token Gating</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-token-gating" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <b-form-group label="Variant">
                    <b-dropdown
                        :text="tokenGatingVariantMap[variant]"
                        v-model="variant"
                        variant="light"
                        toggle-class="form-control d-flex align-items-center justify-content-between"
                        menu-class="w-100"
                        class="w-100"
                    >
                        <b-dropdown-item-button v-for="(v, key) of options" :key="key" @click="onClickVariant(v)">
                            {{ tokenGatingVariantMap[v] }}
                        </b-dropdown-item-button>
                    </b-dropdown>
                </b-form-group>
                <b-form-group
                    label="Contract Address"
                    :state="isValidAddress"
                    invalid-feedback="Please provide a valid contract address."
                >
                    <b-form-input :state="isValidAddress" v-model="contractAddress" @input="onInputContractAddress" />
                </b-form-group>
                <b-form-group label="Required balance" v-if="variant == TokenGatingVariant.ERC20">
                    <b-input-group>
                        <b-form-input v-model="amount" type="number" @input="onInputAmount" />
                    </b-input-group>
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseDropdownSelectNftVariant from '../dropdowns/BaseDropdownSelectNftVariant.vue';
import { TERC1155Perk, TERC20Perk, TERC721Perk, type TPool } from '@thxnetwork/types/interfaces';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
import { isAddress } from 'web3-utils';

const tokenGatingVariantMap = {
    [TokenGatingVariant.ERC20]: 'Coin - ERC20',
    [TokenGatingVariant.ERC721]: 'NFT - ERC721',
    [TokenGatingVariant.ERC1155]: 'NFT - ERC1155',
};

@Component({
    components: { BaseDropdownSelectNftVariant },
})
export default class BaseCardTokenGating extends Vue {
    @Prop() pool!: TPool;
    @Prop() perk!: TERC721Perk | TERC1155Perk | TERC20Perk;

    tokenGatingVariantMap = tokenGatingVariantMap;
    isVisible = false;
    chainInfo = chainInfo;
    TokenGatingVariant = TokenGatingVariant;
    options = [TokenGatingVariant.ERC721, TokenGatingVariant.ERC1155, TokenGatingVariant.ERC20];
    variant: TokenGatingVariant = TokenGatingVariant.ERC721;
    contractAddress = '';
    amount = 0;

    get isValidAddress() {
        return this.contractAddress ? isAddress(this.contractAddress) : null;
    }

    mounted() {
        this.contractAddress = this.perk ? this.perk.tokenGatingContractAddress : this.contractAddress;
        this.variant = this.perk ? this.perk.tokenGatingVariant : this.variant;
        this.amount = this.perk ? this.perk.tokenGatingAmount : this.amount;
        this.isVisible = this.perk ? !!this.perk.tokenGatingContractAddress : this.isVisible;
    }

    onClickVariant(value: TokenGatingVariant) {
        this.variant = value;
        this.$emit('change-variant', this.variant);
    }

    onInputContractAddress(value: string) {
        this.contractAddress = value;
        this.$emit('change-contract-address', this.contractAddress);
    }

    onInputAmount(value: number) {
        this.amount = value;
        this.$emit('change-amount', this.amount);
    }
}
</script>
