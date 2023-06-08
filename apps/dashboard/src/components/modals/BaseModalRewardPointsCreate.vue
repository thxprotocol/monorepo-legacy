<template>
    <base-modal
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Social Quest'"
        :id="id"
        :error="error"
        :loading="isLoading"
        @show="onShow"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit()" id="formRewardPointsCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input v-model="amount" />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardRewardCondition
                            class="mb-3"
                            :rewardCondition="rewardCondition"
                            @change="rewardCondition = $event"
                        />
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
                form="formRewardPointsCreate"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' Social Quest' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { TInfoLink, type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import { mapGetters } from 'vuex';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/index';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardInfoLinks,
    },
    computed: mapGetters({
        totals: 'pointRewards/totals',
        profile: 'account/profile',
    }),
})
export default class ModalRewardPointsCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = 0;
    description = '';
    limit = 0;
    rewardCondition: {
        platform: RewardConditionPlatform;
        interaction: RewardConditionInteraction;
        content: string;
        contentMetadata?: object;
    } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    profile!: IAccount;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TPointReward;

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.rewardCondition = this.reward
            ? {
                  platform: this.reward.platform,
                  interaction: this.reward.interaction,
                  content: this.reward.content,
                  contentMetadata: this.reward.contentMetadata,
              }
            : {
                  platform: RewardConditionPlatform.None,
                  interaction: RewardConditionInteraction.None,
                  content: '',
                  contentMetadata: {},
              };
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
        const payload = {
            ...this.reward,
            _id: this.reward ? this.reward._id : undefined,
            poolId: this.pool._id,
            title: this.title,
            description: this.description,
            amount: this.amount,
            infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
            limit: this.limit,
            platform: this.rewardCondition.platform,
            interaction:
                this.rewardCondition.platform !== RewardConditionPlatform.None
                    ? this.rewardCondition.interaction
                    : RewardConditionInteraction.None,
            content: this.rewardCondition.platform !== RewardConditionPlatform.None ? this.rewardCondition.content : '',
            contentMetadata:
                this.rewardCondition.contentMetadata && this.rewardCondition.platform !== RewardConditionPlatform.None
                    ? this.rewardCondition.contentMetadata
                    : '',
            page: this.reward ? this.reward.page : 1,
        };
        this.isLoading = true;
        this.$store.dispatch(`pointRewards/${this.reward ? 'update' : 'create'}`, payload).then(() => {
            this.$bvModal.hide(this.id);
            this.$emit('submit');
            this.isLoading = false;
        });
    }

    onRewardConditionChange(rewardCondition: any) {
        this.rewardCondition = rewardCondition;
    }
}
</script>
