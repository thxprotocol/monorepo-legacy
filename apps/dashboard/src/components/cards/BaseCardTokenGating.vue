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
            <template>
                <div class="p-3">
                    <base-dropdown-select-token-gating-variant
                        class="ml-auto"
                        :selectedValue="tokenGating ? tokenGating.variant : null"
                        @selected="
                            {
                                tokenGatingVariant = $event;
                                emitChanged();
                            }
                        "
                    />
                    <b-form-group label="Contract Address">
                        <b-alert variant="danger" show v-if="!isValidAddress"> Invalid Contract Address </b-alert>
                        <b-input-group>
                            <b-form-input
                                v-model="contractAddress"
                                @change="
                                    {
                                        validateAddress();
                                        emitChanged();
                                    }
                                "
                            />
                            <template #append>
                                <b-button
                                    v-if="pool"
                                    variant="dark"
                                    target="_blank"
                                    :disabled="isValidAddress"
                                    :href="chainInfo[pool.chainId].blockExplorer + `/token/${contractAddress}`"
                                >
                                    <i class="fas fa-external-link-alt ml-0"></i>
                                </b-button>
                            </template>
                        </b-input-group>
                    </b-form-group>
                    <b-form-group label="Min ERC20 amount" v-if="tokenGatingVariant === TokenGatingVariant.ERC20">
                        <b-input-group>
                            <b-form-input v-model="amount" type="number" @change="emitChanged" />
                        </b-input-group>
                    </b-form-group>
                </div>
            </template>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseDropdownSelectTokenGatingVariant from '../dropdowns/BaseDropdownSelectTokenGatingVariant.vue';
import BaseDropdownSelectNftVariant from '../dropdowns/BaseDropdownSelectNftVariant.vue';
import type { TPool } from '@thxnetwork/dashboard/store/modules/pools';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
import { isAddress } from 'web3-utils';
import { TTokenGating } from '@thxnetwork/types/interfaces';

@Component({
    components: { BaseDropdownSelectNftVariant, BaseDropdownSelectTokenGatingVariant },
})
export default class BaseCardTokenGating extends Vue {
    @Prop() pool!: TPool;
    @Prop() tokenGating!: TTokenGating;
    isVisible = false;
    chainInfo = chainInfo;
    TokenGatingVariant = TokenGatingVariant;
    contractAddress = '';
    amount = 0;
    tokenGatingVariant: TokenGatingVariant | null = null;
    isValidAddress = true;

    validateAddress() {
        this.isValidAddress = !this.contractAddress.length || isAddress(this.contractAddress);
    }

    mounted() {
        this.contractAddress = this.tokenGating ? this.tokenGating.contractAddress : '';
        this.tokenGatingVariant = this.tokenGating ? this.tokenGating.variant : null;
        this.amount = this.tokenGating && this.tokenGating.amount !== undefined ? this.tokenGating.amount : 0;
        this.validateAddress();
    }

    emitChanged() {
        this.$emit('changeTokenGating', {
            variant: this.tokenGatingVariant,
            contractAddress: this.contractAddress,
            amount: this.amount,
        });
    }
}
</script>
