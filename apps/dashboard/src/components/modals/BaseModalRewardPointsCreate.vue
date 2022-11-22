<template>
    <base-modal size="xl" title="Create Points Reward" id="modalRewardPointsCreate" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">
                Points rewards are distributed to your customers achieving milestones in your customer journey.
            </p>
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
                        <b-card body-class="bg-light">
                            <strong>Reward condition</strong>
                            <p class="text-gray">
                                Configure under what conditions your customers are eligible for this reward claim.
                            </p>
                            <b-form-group label="Platform">
                                <BaseDropdownChannelTypes @selected="onSelectChannel" :channel="platform" />
                            </b-form-group>

                            <b-alert variant="info" show v-if="platform.type !== ChannelType.None && !isAuthorized">
                                <p>
                                    <i class="fas fa-info-circle mr-1"></i> Connect with your
                                    {{ platform.name }} account to create conditions for your content.
                                </p>
                                <b-button
                                    block
                                    variant="dark"
                                    @click="$store.dispatch('account/connectRedirect', platform.type)"
                                >
                                    <img :src="platform.logoURI" width="20" class="mr-2" /> Connect account
                                </b-button>
                            </b-alert>
                            <template v-else-if="platform.type !== ChannelType.None">
                                <b-form-group label="Interaction">
                                    <BaseDropdownChannelActions
                                        @selected="onSelectInteraction"
                                        :actions="actions"
                                        :action="interaction"
                                    />
                                </b-form-group>
                                <component
                                    v-if="interaction"
                                    :is="interactionComponent"
                                    @selected="content = $event"
                                    :items="interaction.items"
                                    :item="content"
                            /></template>
                        </b-card>
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
                {{ reward ? 'Update Reward' : 'Create Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import {
    ChannelType,
    ChannelAction,
    channelList,
    channelActionList,
    IChannel,
    IChannelAction,
} from '@thxnetwork/dashboard/types/rewards';
import BaseModal from './BaseModal.vue';
import BaseDropdownChannelTypes from '../dropdowns/BaseDropdownChannelTypes.vue';
import BaseDropdownChannelActions from '../dropdowns/BaseDropdownChannelActions.vue';
import BaseDropdownYoutubeChannels from '../dropdowns/BaseDropdownYoutubeChannels.vue';
import BaseDropdownYoutubeUploads from '../dropdowns/BaseDropdownYoutubeUploads.vue';
import BaseDropdownYoutubeVideo from '../dropdowns/BaseDropdownYoutubeVideo.vue';
import BaseDropdownTwitterTweets from '../dropdowns/BaseDropdownTwitterTweets.vue';
import BaseDropdownTwitterUsers from '../dropdowns/BaseDropdownTwitterUsers.vue';
import { mapGetters } from 'vuex';
import { UserProfile } from 'oidc-client-ts';

@Component({
    components: {
        BaseModal,
        BaseDropdownChannelTypes,
        BaseDropdownChannelActions,
        BaseDropdownYoutubeChannels,
        BaseDropdownYoutubeUploads,
        BaseDropdownYoutubeVideo,
        BaseDropdownTwitterTweets,
        BaseDropdownTwitterUsers,
    },
    computed: mapGetters({
        profile: 'account/profile',
        youtube: 'account/youtube',
        twitter: 'account/twitter',
    }),
})
export default class ModalRewardCreate extends Vue {
    ChannelType = ChannelType;
    ChannelAction = ChannelAction;
    isSubmitDisabled = false;
    isLoading = false;
    interactionComponent = '';
    error = '';
    title = '';
    amount = '0';
    description = '';
    platform: IChannel = channelList[0];
    interaction: IChannelAction = channelActionList[0];
    content = '';
    isAuthorized = false;

    profile!: UserProfile;
    youtube!: any;
    twitter!: any;

    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TPointReward;

    get actions() {
        return channelActionList.filter((a) => this.platform.actions.includes(a.type));
    }

    mounted() {
        if (this.reward) {
            this.title = this.reward.title;
            this.amount = this.reward.amount;
            this.description = this.reward.description;
        }
    }

    async onSelectChannel(channel: IChannel) {
        this.platform = channel;
        this.content = '';

        switch (channel.type) {
            case ChannelType.YouTube: {
                await this.$store.dispatch('account/getYoutube');
                this.interaction = this.getInteraction(ChannelAction.YouTubeLike);
                this.isAuthorized = !!this.youtube;
                break;
            }
            case ChannelType.Twitter: {
                await this.$store.dispatch('account/getTwitter');
                this.interaction = this.getInteraction(ChannelAction.TwitterLike);
                this.isAuthorized = !!this.twitter;
                break;
            }
            default:
        }
        this.onSelectInteraction(this.interaction);
    }

    onSelectInteraction(interaction: IChannelAction) {
        this.interaction = interaction;
        this.content = '';

        switch (this.interaction.type) {
            case ChannelAction.YouTubeLike: {
                if (!this.youtube) return;
                this.interaction.items = this.youtube.videos;
                break;
            }
            case ChannelAction.YouTubeSubscribe: {
                if (!this.youtube) return;
                this.interaction.items = this.youtube.channels;
                break;
            }
            case ChannelAction.TwitterLike:
            case ChannelAction.TwitterRetweet: {
                if (!this.twitter) return;
                this.interaction.items = this.twitter.tweets;
                break;
            }
            case ChannelAction.TwitterFollow: {
                if (!this.twitter) return;
                this.interaction.items = this.twitter.users;
                break;
            }
            default:
                return;
        }

        this.interactionComponent = this.getInteractionComponent();
    }

    onSubmit() {
        this.$store.dispatch('pointRewards/create', {
            title: this.title,
            description: this.description,
            amount: this.amount,
            platform: this.platform,
            interaction: this.interaction,
            content: this.content,
        });
    }

    getInteractionComponent() {
        switch (this.interaction.type) {
            case ChannelAction.YouTubeSubscribe:
                return 'BaseDropdownYoutubeChannels';
            case ChannelAction.YouTubeLike:
                return 'BaseDropdownYoutubeVideo';
            case ChannelAction.TwitterLike:
            case ChannelAction.TwitterRetweet:
                return 'BaseDropdownTwitterTweets';
            case ChannelAction.TwitterFollow:
                return 'BaseDropdownTwitterUsers';
            default:
                return '';
        }
    }

    getInteraction(interactionType: ChannelAction): IChannelAction {
        return channelActionList.find((a) => a.type === interactionType) as IChannelAction;
    }
}
</script>
