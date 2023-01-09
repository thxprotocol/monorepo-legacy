<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-condition
        >
            <strong>Reward condition</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-condition" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <p class="text-gray">Configure under what conditions your customers are eligible for this claim.</p>
                <b-form-group label="Platform">
                    <BaseDropdownChannelTypes @selected="onSelectPlatform" :platform="platform" />
                </b-form-group>
                <BSpinner v-if="isLoadingPlatform" variant="dark" small />
                <template v-if="platform && platform.type !== RewardConditionPlatform.None && !isLoadingPlatform">
                    <template v-if="isAuthorized">
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
                            @selected="onSelectContent"
                            :items="interaction.items"
                            :item="content"
                        />
                    </template>
                    <b-alert v-else variant="info" show>
                        <p>
                            <i class="fas fa-info-circle mr-1"></i> Connect with your {{ platform.name }} account to
                            create conditions for your content.
                        </p>
                        <b-button block variant="dark" @click="onClickConnect">
                            <img :src="platform.logoURI" width="20" class="mr-2" /> Connect account
                        </b-button>
                    </b-alert>
                </template>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from 'oidc-client-ts';
import { platformList, platformInteractionList, IChannel, IChannelAction } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/index';
import BaseDropdownChannelTypes from '../dropdowns/BaseDropdownChannelTypes.vue';
import BaseDropdownChannelActions from '../dropdowns/BaseDropdownChannelActions.vue';
import BaseDropdownYoutubeChannels from '../dropdowns/BaseDropdownYoutubeChannels.vue';
import BaseDropdownYoutubeUploads from '../dropdowns/BaseDropdownYoutubeUploads.vue';
import BaseDropdownYoutubeVideo from '../dropdowns/BaseDropdownYoutubeVideo.vue';
import BaseDropdownTwitterTweets from '../dropdowns/BaseDropdownTwitterTweets.vue';
import BaseDropdownTwitterUsers from '../dropdowns/BaseDropdownTwitterUsers.vue';
import BaseDropdownDiscordGuilds from '../dropdowns/BaseDropdownDiscordGuilds.vue';

@Component({
    components: {
        BaseDropdownDiscordGuilds,
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
        discord: 'account/discord',
    }),
})
export default class BaseCardRewardCondition extends Vue {
    RewardConditionInteraction = RewardConditionInteraction;
    RewardConditionPlatform = RewardConditionPlatform;
    isLoadingPlatform = false;
    interactionComponent = '';
    title = '';
    amount = '0';
    description = '';
    platform: IChannel = platformList[0];
    interaction: IChannelAction = platformInteractionList[0];
    content = '';
    isAuthorized = false;
    isVisible = false;

    profile!: UserProfile;
    youtube!: any;
    twitter!: any;
    discord!: any;

    @Prop({ required: false }) rewardCondition!: {
        platform: RewardConditionPlatform;
        interaction: RewardConditionInteraction;
        content: string;
    };

    get actions() {
        return platformInteractionList.filter((a) => this.platform.actions.includes(a.type));
    }

    async mounted() {
        if (this.rewardCondition) {
            const { platform, interaction, content } = this.rewardCondition;
            // await this.onSelectPlatform(this.platform);
            this.platform = platformList.find((c) => c.type === platform) as IChannel;
            this.isLoadingPlatform = true;
            switch (this.platform.type) {
                case RewardConditionPlatform.Google: {
                    await this.$store.dispatch('account/getYoutube');
                    this.isAuthorized = !!this.youtube;
                    break;
                }
                case RewardConditionPlatform.Twitter: {
                    await this.$store.dispatch('account/getTwitter');
                    this.isAuthorized = !!this.twitter;
                    break;
                }
                default:
            }
            this.interaction = platformInteractionList.find((i) => i.type === interaction) as IChannelAction;
            this.content = content;
            this.isVisible = !!this.platform.type;
            this.isLoadingPlatform = false;
        }
    }

    onClickConnect() {
        this.$store.dispatch('account/connectRedirect', {
            platform: this.platform.type,
            returnUrl: window.location.href,
        });
    }

    async onSelectPlatform(platform: IChannel) {
        if (!platform) return;

        this.isLoadingPlatform = true;
        this.platform = platform;

        switch (platform.type) {
            case RewardConditionPlatform.Google: {
                this.onSelectInteraction(platformInteractionList[1]);
                await this.$store.dispatch('account/getYoutube');
                this.isAuthorized = !!this.youtube;
                break;
            }
            case RewardConditionPlatform.Twitter: {
                await this.$store.dispatch('account/getTwitter');
                this.onSelectInteraction(platformInteractionList[3]);
                this.isAuthorized = !!this.twitter;
                break;
            }
            case RewardConditionPlatform.Discord: {
                await this.$store.dispatch('account/getDiscord');
                this.onSelectInteraction(platformInteractionList[6]);
                this.isAuthorized = !!this.discord;
                break;
            }
            default:
        }

        this.isLoadingPlatform = false;
    }

    onSelectInteraction(interaction: IChannelAction) {
        if (!interaction) return;

        this.interaction = interaction;

        switch (this.interaction.type) {
            case RewardConditionInteraction.YouTubeLike: {
                if (!this.youtube) return;
                this.interaction.items = this.youtube.videos;
                break;
            }
            case RewardConditionInteraction.YouTubeSubscribe: {
                if (!this.youtube) return;
                this.interaction.items = this.youtube.channels;
                break;
            }
            case RewardConditionInteraction.TwitterLike:
            case RewardConditionInteraction.TwitterRetweet: {
                if (!this.twitter) return;
                this.interaction.items = this.twitter.tweets;
                break;
            }
            case RewardConditionInteraction.TwitterFollow: {
                if (!this.twitter) return;
                this.interaction.items = this.twitter.users;
                break;
            }
            case RewardConditionInteraction.DiscordGuildJoined: {
                if (!this.discord) return;
                this.interaction.items = this.discord.guilds;
                break;
            }
            default:
                return;
        }

        this.interactionComponent = this.getInteractionComponent();
    }

    onSelectContent(content: any) {
        this.content =
            content &&
            content.referenced_tweets &&
            content.referenced_tweets[0] &&
            content.referenced_tweets[0].type === 'retweeted'
                ? content.referenced_tweets[0].id
                : content.id;
        this.change();
    }

    change() {
        if (!this.platform.type) return;
        this.$emit('change', {
            platform: this.platform.type,
            interaction: this.interaction.type,
            content: this.content,
        });
    }

    getInteractionComponent() {
        switch (this.interaction.type) {
            case RewardConditionInteraction.YouTubeSubscribe:
                return 'BaseDropdownYoutubeChannels';
            case RewardConditionInteraction.YouTubeLike:
                return 'BaseDropdownYoutubeVideo';
            case RewardConditionInteraction.TwitterLike:
            case RewardConditionInteraction.TwitterRetweet:
                return 'BaseDropdownTwitterTweets';
            case RewardConditionInteraction.TwitterFollow:
                return 'BaseDropdownTwitterUsers';
            case RewardConditionInteraction.DiscordGuildJoined:
                return 'BaseDropdownDiscordGuilds';
            default:
                return '';
        }
    }

    getInteraction(interactionType: RewardConditionInteraction): IChannelAction {
        return platformInteractionList.find((a) => a.type === interactionType) as IChannelAction;
    }
}
</script>
