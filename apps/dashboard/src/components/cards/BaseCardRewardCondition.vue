<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-condition
        >
            <strong>Conditions</strong>
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
                        :item="content"
                        @selected="onSelectContent"
                    />
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
    isVisible = false;

    profile!: UserProfile;

    @Prop({ required: false }) rewardCondition!: {
        platform: RewardConditionPlatform;
        interaction: RewardConditionInteraction;
        content: string;
    };

    get actions() {
        return platformInteractionList.filter((a) => this.platform.actions.includes(a.type));
    }

    async mounted() {
        this.isLoadingPlatform = true;
        this.platform = this.rewardCondition
            ? (platformList.find((c) => c.type === this.rewardCondition.platform) as IChannel)
            : platformList[0];
        this.interaction = this.rewardCondition
            ? this.getInteraction(this.rewardCondition.interaction)
            : this.getInteraction(0);
        this.content = this.rewardCondition ? this.rewardCondition.content : '';
        this.isVisible = !!this.platform.type;
        this.isLoadingPlatform = false;
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
        this.isLoadingPlatform = false;
        this.change();
    }

    onSelectInteraction(interaction: IChannelAction) {
        if (!interaction) return;

        this.interaction = interaction;
        this.interactionComponent = this.getInteractionComponent();
    }

    onSelectContent(content: any) {
        this.content = content;
        this.change();
    }

    change() {
        if (this.platform.type === undefined) return;
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
