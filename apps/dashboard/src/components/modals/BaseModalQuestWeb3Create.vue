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
                        <b-form-group label="Contract Address" :state="isValidContractAddress">
                            <b-form-input v-model="contractAddress" :state="isValidContractAddress" />
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
                :disabled="isSubmitDisabled || !isValidContractAddress"
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
import BaseModal from './BaseModal.vue';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardInfoLinks,
    },
})
export default class ModalQuestWeb3Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    error = '';
    title = '';
    description = '';
    amount = 0;
    contractAddress = '';
    methodName = '';
    threshold = 0;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TWeb3Quest;

    get isValidContractAddress() {
        if (!this.contractAddress) return;
        return isAddress(this.contractAddress);
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.contractAddress = this.reward ? this.reward.contractAddress : this.contractAddress;
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
                contractAddress: this.contractAddress,
                methodName: this.methodName,
                threshold: this.threshold,
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
