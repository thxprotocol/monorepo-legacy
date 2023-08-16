<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Web3 Quest'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit" id="formQuestWeb3Create">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input type="number" v-model="amount" />
                        </b-form-group>
                        <b-form-group label="Smart Contract">
                            <b-row :key="key" v-for="(contract, key) of contracts">
                                <b-col md="3" class="mb-2">
                                    <b-form-select v-model="contract.chainId">
                                        <b-form-select-option
                                            :key="key"
                                            :value="chain.chainId"
                                            v-for="(chain, key) of chainInfo"
                                        >
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
                        </b-form-group>
                        <b-row>
                            <b-col md="6">
                                <b-form-group
                                    label="Method Name"
                                    description="This method will be called with an address and should return an integer."
                                >
                                    <b-form-input v-model="methodName" />
                                </b-form-group>
                            </b-col>
                            <b-col md="6">
                                <b-form-group label="Threshold">
                                    <b-form-input type="number" v-model="threshold" />
                                </b-form-group>
                            </b-col>
                        </b-row>
                    </b-col>
                    <b-col md="6">
                        <BaseCardInfoLinks :info-links="infoLinks" @change-link="onChangeLink">
                            <p class="text-muted">
                                Add info links to your cards to provide more information to your audience.
                            </p>
                        </BaseCardInfoLinks>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formQuestWeb3Create"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' Web3 Quest' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TInfoLink, TPool, TWeb3Quest } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { isAddress } from 'web3-utils';
import { ChainId } from '@thxnetwork/types/enums';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { NODE_ENV } from '@thxnetwork/dashboard/utils/secrets';
import BaseModal from './BaseModal.vue';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardInfoLinks,
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
    error = '';
    title = '';
    description = '';
    amount = 0;
    methodName = '';
    threshold = 0;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    contracts: { chainId: ChainId; address: string }[] = [{ chainId: ChainId.Polygon, address: '' }];

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TWeb3Quest;

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.contracts = this.reward ? this.reward.contracts : this.contracts;
        this.methodName = this.reward ? this.reward.methodName : this.methodName;
        this.threshold = this.reward ? this.reward.threshold : this.threshold;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
    }

    onChangeLink({ key, label, url }: TInfoLink & { key: number }) {
        let update = {};

        if (label || label === '') update = { ...this.infoLinks[key], label };
        if (url || url === '') update = { ...this.infoLinks[key], url };
        if (typeof label === 'undefined' && typeof url === 'undefined') {
            Vue.delete(this.infoLinks, key);
        } else {
            Vue.set(this.infoLinks, key, update);
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`web3Quests/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                page: 1,
                index: this.reward ? this.reward.index : this.total,
                poolId: String(this.pool._id),
                title: this.title,
                description: this.description,
                amount: this.amount,
                methodName: this.methodName,
                threshold: this.threshold,
                contracts: JSON.stringify(this.contracts),
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
            })
            .then(() => {
                this.$emit('submit');
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
