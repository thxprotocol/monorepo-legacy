<template>
    <BaseModalQuestCreate
        variant="Web3 Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-info-links="infoLinks = Object.values($event)"
        @change-title="title = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-published="isPublished = $event"
        @change-date="expiryDate = $event"
        @change-locks="locks = $event"
        :published="isPublished"
        :id="id"
        :error="error"
        :info-links="infoLinks"
        :loading="isLoading"
        :disabled="isSubmitDisabled"
        :quest="reward"
        :pool="pool"
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
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
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
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    isPublished = false;
    error = '';
    title = '';
    image = '';
    file: File | null = null;
    description = '';
    amount = 0;
    methodName = '';
    threshold = '0';
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    contracts: { chainId: ChainId; address: string }[] = [{ chainId: ChainId.Polygon, address: '' }];
    expiryDate: Date | number | null = null;
    locks: TQuestLock[] = [];

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestWeb3;

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.contracts = this.reward ? this.reward.contracts : this.contracts;
        this.methodName = this.reward ? this.reward.methodName : this.methodName;
        this.threshold = this.reward ? this.reward.threshold : this.threshold;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.locks = this.reward ? this.reward.locks : this.locks;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                variant: QuestVariant.Web3,
                page: 1,
                index: this.reward ? this.reward.index : this.total,
                isPublished: this.isPublished,
                poolId: String(this.pool._id),
                file: this.file,
                title: this.title,
                description: this.description,
                amount: this.amount,
                methodName: this.methodName,
                threshold: this.threshold,
                expiryDate: this.expiryDate,
                contracts: JSON.stringify(this.contracts),
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                locks: this.locks,
            })
            .then(() => {
                this.$emit('submit', { isPublished: this.isPublished });
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
