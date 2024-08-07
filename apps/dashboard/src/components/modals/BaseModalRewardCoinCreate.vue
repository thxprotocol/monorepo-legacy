<template>
    <BaseModalRewardCreate
        @show="onShow"
        @submit="onSubmit"
        :pool="pool"
        :id="id"
        :reward="reward"
        :error="error"
        :is-loading="isLoading"
    >
        <BaseFormGroup
            label="Wallet"
            required
            tooltip="This Safe multisig will be used to automatically transfer coins towards participants upon reward purchase."
        >
            <BaseDropdownSelectWallet @selected="onSelectWallet" :pool="pool" :wallet="wallet" />
        </BaseFormGroup>
        <b-alert v-if="!wallet" variant="primary"> Create a campaign wallet first. </b-alert>
        <BaseFormGroup
            v-else
            label="Coin"
            tooltip="An ERC20 contract on Polygon of which your campaign Safe has a balance."
        >
            <BaseDropdownSelectERC20 @update="onSelectERC20" :chainId="wallet.chainId" :erc20="erc20" />
            <template #description>
                Balance: <b-link @click="openAddressUrl" target="_blank">{{ balance }}</b-link>
            </template>
        </BaseFormGroup>
        <BaseFormGroup
            label="Coin Amount"
            tooltip="The amount of coins that will be transferred from your campaign Safe to the campaign participant wallet."
        >
            <b-form-input v-model="amount" />
        </BaseFormGroup>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IERC20s, TERC20BalanceState } from '@thxnetwork/dashboard/types/erc20';
import { RewardVariant } from '@thxnetwork/common/enums';
import { parseUnits } from 'ethers/lib/utils';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import BaseDropdownSelectERC20 from '../dropdowns/BaseDropdownSelectERC20.vue';
import BaseDropdownSelectWallet from '../dropdowns/BaseDropdownSelectWallet.vue';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';

@Component({
    components: {
        BaseModalRewardCreate,
        BaseDropdownSelectERC20,
        BaseDropdownSelectWallet,
    },
    computed: mapGetters({
        erc20List: 'erc20/all',
        erc20BalanceList: 'erc20/balances',
    }),
})
export default class ModalRewardCoinCreate extends Vue {
    parseUnits = parseUnits;
    isLoading = false;
    error = '';
    amount = '0';
    wallet: TWallet | null = null;
    erc20Id = '';
    erc20List!: IERC20s;
    erc20BalanceList!: TERC20BalanceState;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TRewardCoin;

    get erc20() {
        return this.erc20List[this.erc20Id];
    }

    get balance() {
        if (!this.wallet || !this.erc20 || !this.erc20BalanceList[this.erc20.address]) return '0';
        return parseUnits(this.erc20BalanceList[this.erc20.address][this.wallet.address as string], 18);
    }

    openAddressUrl() {
        if (!this.wallet) return '';
        const url = `${chainInfo[this.erc20.chainId].blockExplorer}/address/${this.wallet.address}`;
        return (window as any).open(url, '_blank').focus();
    }

    onShow() {
        this.erc20Id = this.reward ? this.reward.erc20Id : this.erc20Id;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.wallet = this.reward ? this.reward.wallet : this.wallet;
    }

    onSelectWallet(wallet) {
        this.wallet = wallet;
        this.erc20Id = '';
    }

    onSelectERC20(erc20: TERC20 | null) {
        this.erc20Id = erc20 ? erc20._id : '';

        if (this.erc20) {
            this.$store.dispatch('erc20/balanceOf', { tokenAddress: this.erc20.address, wallet: this.wallet });
        }
    }

    async onSubmit(payload: TBaseReward) {
        this.isLoading = true;

        try {
            await this.$store.dispatch(`pools/${this.reward ? 'update' : 'create'}Reward`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.Coin,
                erc20Id: this.erc20._id,
                amount: this.amount,
            });
            this.$emit('submit', { isPublished: payload.isPublished });
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
