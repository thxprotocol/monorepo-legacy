<template>
    <BaseModalQuestCreate
        label="Web3 Quest"
        @show="onShow"
        @submit="onSubmit"
        :id="id"
        :pool="pool"
        :quest="quest"
        :loading="isLoading"
        :disabled="isSubmitDisabled"
        :error="error"
    >
        <template #col-left>
            <BaseFormGroup
                required
                label="Amount"
                tooltip="The amount of points the campaign participant will earn for completing this quest."
            >
                <b-form-input type="number" v-model="amount" />
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Smart Contract"
                tooltip="Provide one or more addresses for smart contracts on the supported networks."
            >
                <b-row :key="key" v-for="(contract, key) of contracts">
                    <b-col md="3" class="mb-2">
                        <b-form-select v-model="contract.chainId">
                            <b-form-select-option :key="key" :value="chain.chainId" v-for="(chain, key) of chainInfo">
                                {{ chain.name }}
                            </b-form-select-option>
                        </b-form-select>
                    </b-col>
                    <b-col md="9">
                        <b-input-group>
                            <b-form-input
                                v-model="contract.address"
                                :state="contract.address ? isAddress(contract.address) : null"
                                placeholder="Contract Address"
                            />
                            <b-input-group-append>
                                <b-button @click="$delete(contracts, key)" variant="gray">
                                    <i class="fas fa-times ml-0"></i>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-col>
                </b-row>
                <b-link @click="contracts.push({ chainId: ChainId.Polygon, address: '' })">
                    Add another contract
                </b-link>
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Contract Method"
                description="E.g. 'balanceOf' for ERC20 contracts."
                tooltip="This method will be called with an address and should return a number."
            >
                <b-form-input v-model="methodName" />
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Threshold"
                description="E.g. '1000000000000000000' for 1 THX since ERC20 uses 18 decimals."
                tooltip="The number that is returned by the contract call should be equal or greater than this threshold value."
            >
                <b-form-input type="number" v-model="threshold" />
            </BaseFormGroup>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isAddress } from 'web3-utils';
import { ChainId, QuestVariant } from '@thxnetwork/common/enums';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { NODE_ENV } from '@thxnetwork/dashboard/config/secrets';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
    },
})
export default class ModalQuestWeb3Create extends Vue {
    ChainId = ChainId;
    chainInfo = Object.values(chainInfo).filter((x) =>
        x.chainId === ChainId.Hardhat && NODE_ENV === 'production' ? false : true,
    );
    isAddress = isAddress;
    isLoading = false;
    isVisible = true;
    error = '';
    amount = 0;
    methodName = '';
    threshold = '0';
    contracts: { chainId: ChainId; address: string }[] = [{ chainId: ChainId.Polygon, address: '' }];

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuestWeb3;

    get isSubmitDisabled() {
        const isContractAddressInvalid = this.contracts.some((x) => !isAddress(x.address));
        return !this.contracts.length || isContractAddressInvalid || !this.methodName;
    }

    onShow() {
        this.amount = this.quest ? this.quest.amount : this.amount;
        this.contracts = this.quest ? this.quest.contracts : this.contracts;
        this.methodName = this.quest ? this.quest.methodName : this.methodName;
        this.threshold = this.quest ? this.quest.threshold : this.threshold;
    }

    async onSubmit(payload: TBaseQuest) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.quest ? 'updateQuest' : 'createQuest'}`, {
                ...this.quest,
                ...payload,
                variant: QuestVariant.Web3,
                amount: this.amount,
                methodName: this.methodName,
                threshold: this.threshold,
                contracts: JSON.stringify(this.contracts),
            });

            this.$emit('submit', { isPublished: payload.isPublished });
            this.$bvModal.hide(this.id);
        } catch (error: any) {
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
