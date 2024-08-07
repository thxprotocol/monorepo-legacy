<template>
    <base-modal :error="error" title="Create Coin" id="modalERC20Create">
        <template #modal-body>
            <BaseFormGroupNetwork @selected="chainId = $event" :chainId="chainId" />
            <b-form-group label="Variant">
                <b-form-radio v-model="tokenType" name="tokenType" :value="ERC20Type.Unlimited">
                    <strong>Unlimited Supply Token </strong>
                    <p class="text-muted">
                        Tokens will be minted by the asset pool when an outgoing transfer is required. You don't have to
                        worry about periodic deposits.
                    </p>
                </b-form-radio>
                <b-form-radio v-model="tokenType" name="tokenType" :value="ERC20Type.Limited">
                    <strong> Limited Supply Token </strong>
                    <p class="text-muted">
                        Tokens with a limited supply are considered scarce assets and have the potential to gain
                        monetary value when publically traded.
                    </p>
                </b-form-radio>
            </b-form-group>
            <b-row>
                <b-col>
                    <b-form-group label="Name">
                        <b-form-input id="erc20Name" v-model="name" placeholder="XYZ Network Token" />
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="Symbol">
                        <b-form-input id="erc20Symbol" v-model="symbol" placeholder="XYZ" />
                    </b-form-group>
                </b-col>
            </b-row>
            <b-form-group label="Total Supply" v-if="tokenType === ERC20Type.Limited">
                <b-form-input min="0" type="number" v-model="totalSupply" />
            </b-form-group>
            <b-form-group label="Icon image">
                <b-form-file v-model="logoImg" accept="image/*" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="loading" class="rounded-pill" @click="submit()" variant="primary" block>
                <b-spinner v-if="loading" small />
                <template v-else>Create Coin</template>
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { ERC20Type, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { toWei } from 'web3-utils';
import BaseFormGroupNetwork from '../form-group/BaseFormGroupNetwork.vue';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
        BaseFormGroupNetwork,
    },
    computed: mapGetters({}),
})
export default class ModalERC20Create extends Vue {
    ERC20Type = ERC20Type;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    publicUrl = process.env.VUE_APP_PUBLIC_URL;
    loading = false;
    error = '';

    tokenType = ERC20Type.Unlimited;
    tokenList: TERC20[] = [];
    chainId: ChainId = ChainId.Polygon;

    erc20Token: TERC20 | null = null;
    erc20TokenAddress = '';

    name = '';
    symbol = '';
    totalSupply = 0;
    logoImg: File | null = null;

    async submit() {
        try {
            this.loading = true;

            await this.$store.dispatch('erc20/create', {
                chainId: this.chainId,
                name: this.name,
                symbol: this.symbol,
                type: this.tokenType,
                totalSupply: this.tokenType === ERC20Type.Limited ? toWei(String(this.totalSupply)) : 0,
                file: this.logoImg,
            });

            this.$bvModal.hide(`modalERC20Create`);
        } catch (error) {
            throw error;
        } finally {
            this.loading = false;
        }
    }
}
</script>
