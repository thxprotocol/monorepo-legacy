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
        <b-form-group label="Amount">
            <b-form-input v-model="amount" placeholder="Amount" type="number" min="0" />
        </b-form-group>
        <b-form-group label="Contract Details">
            <b-form-input v-model="contractChannelName" class="mb-2" placeholder="Channel Name" />
            <b-form-input v-model="contractChaincodeName" class="mb-2" placeholder="Chaincode Name" />
            <b-form-input v-model="contractContractName" class="mb-2" placeholder="Contract Name" />
        </b-form-group>
        <b-form-group label="Token">
            <b-form-input v-model="tokenCollection" class="mb-2" placeholder="Collection" />
            <b-form-input v-model="tokenCategory" class="mb-2" placeholder="Category" />
            <b-form-input v-model="tokenType" class="mb-2" placeholder="Type" />
            <b-form-input v-model="tokenAdditionalKey" class="mb-2" placeholder="AdditionalKey" />
            <b-form-input v-model="tokenInstance" class="mb-2" type="number" placeholder="Instance" />
        </b-form-group>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RewardVariant } from '@thxnetwork/common/enums';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';

@Component({
    components: {
        BaseModalRewardCreate,
    },
    computed: mapGetters({
        guildsList: 'pools/guilds',
    }),
})
export default class ModalRewardGalachainCreate extends Vue {
    isLoading = false;
    error = '';
    contractChannelName = '';
    contractChaincodeName = '';
    contractContractName = '';
    tokenCollection = '';
    tokenCategory = '';
    tokenType = '';
    tokenAdditionalKey = '';
    tokenInstance = 0;
    amount = 0;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TRewardGalachain;

    async onShow() {
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.contractChannelName = this.reward ? this.reward.contractChannelName : this.contractChannelName;
        this.contractChaincodeName = this.reward ? this.reward.contractChaincodeName : this.contractChaincodeName;
        this.contractContractName = this.reward ? this.reward.contractContractName : this.contractContractName;
        this.tokenCollection = this.reward ? this.reward.tokenCollection : this.tokenCollection;
        this.tokenCategory = this.reward ? this.reward.tokenCategory : this.tokenCategory;
        this.tokenType = this.reward ? this.reward.tokenType : this.tokenType;
        this.tokenAdditionalKey = this.reward ? this.reward.tokenAdditionalKey : this.tokenAdditionalKey;
        this.tokenInstance = this.reward ? this.reward.tokenInstance : this.tokenInstance;
    }

    async onSubmit(payload: TReward) {
        try {
            this.isLoading = true;
            await this.$store.dispatch(`pools/${this.reward ? 'update' : 'create'}Reward`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.Galachain,
                amount: this.amount,
                contractChannelName: this.contractChannelName,
                contractChaincodeName: this.contractChaincodeName,
                contractContractName: this.contractContractName,
                tokenCollection: this.tokenCollection,
                tokenCategory: this.tokenCategory,
                tokenType: this.tokenType,
                tokenAdditionalKey: this.tokenAdditionalKey,
                tokenInstance: this.tokenInstance,
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
