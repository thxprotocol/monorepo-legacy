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
                <b-alert
                    show
                    variant="warning"
                    class="d-flex align-items-center justify-content-between"
                    v-if="platform.type === RewardConditionPlatform.Twitter && !profile.twitterAccess"
                >
                    <div>
                        <i class="fas fa-exclamation-circle mr-1" />
                        Please connect your Twitter account!
                    </div>
                    <b-button @click="onClickConnect(AccessTokenKind.Twitter)" variant="primary" size="sm">
                        Connect
                    </b-button>
                </b-alert>
                <template v-if="platform && platform.type !== RewardConditionPlatform.None">
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
                        :content="content"
                        :contentMetadata="contentMetadata"
                        @selected="onSelectContent"
                    />
                </template>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import {
    platformList,
    platformInteractionList,
    IChannel,
    IChannelAction,
    getPlatform,
    getInteraction,
    getInteractionComponent,
} from '@thxnetwork/dashboard/types/rewards';
import { AccessTokenKind, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { TAccount } from '@thxnetwork/types/interfaces';
import BaseDropdownChannelTypes from '../dropdowns/BaseDropdownChannelTypes.vue';
import BaseDropdownChannelActions from '../dropdowns/BaseDropdownChannelActions.vue';
import BaseDropdownYoutubeChannels from '../dropdowns/BaseDropdownYoutubeChannels.vue';
import BaseDropdownYoutubeVideo from '../dropdowns/BaseDropdownYoutubeVideo.vue';
import BaseDropdownTwitterTweets from '../dropdowns/BaseDropdownTwitterTweets.vue';
import BaseDropdownTwitterUsers from '../dropdowns/BaseDropdownTwitterUsers.vue';
import BaseDropdownDiscordGuilds from '../dropdowns/BaseDropdownDiscordGuilds.vue';
import BaseDropdownDiscordMessage from '../dropdowns/BaseDropdownDiscordMessage.vue';
import BaseDropdownDiscordMessageReaction from '../dropdowns/BaseDropdownDiscordMessageReaction.vue';
import BaseDropdownTwitterMessage from '../dropdowns/BaseDropdownTwitterMessage.vue';

@Component({
    components: {
        BaseDropdownDiscordGuilds,
        BaseDropdownDiscordMessage,
        BaseDropdownDiscordMessageReaction,
        BaseDropdownChannelTypes,
        BaseDropdownChannelActions,
        BaseDropdownYoutubeChannels,
        BaseDropdownYoutubeVideo,
        BaseDropdownTwitterTweets,
        BaseDropdownTwitterUsers,
        BaseDropdownTwitterMessage,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseCardRewardCondition extends Vue {
    AccessTokenKind = AccessTokenKind;
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
    contentMetadata: any;
    isVisible = false;
    profile!: TAccount;

    @Prop({ required: false }) rewardCondition!: {
        platform: RewardConditionPlatform;
        interaction: RewardConditionInteraction;
        content: string;
        contentMetadata: any;
    };

    get actions() {
        return platformInteractionList.filter((a) => this.platform.actions.includes(a.type));
    }

    async mounted() {
        this.platform = this.rewardCondition ? getPlatform(this.rewardCondition.platform) : getPlatform(0);
        this.interaction = this.rewardCondition ? getInteraction(this.rewardCondition.interaction) : getInteraction(0);
        this.content = this.rewardCondition ? this.rewardCondition.content : '';
        this.contentMetadata = this.rewardCondition ? this.rewardCondition.contentMetadata : {};
        this.isVisible = !!this.platform.type;
    }

    async onClickConnect(kind: AccessTokenKind) {
        await this.$store.dispatch('account/connect', kind);
    }

    onSelectPlatform(platform: IChannel) {
        if (!platform) return;

        this.platform = platform;
        this.content = '';
        this.onSelectInteraction(this.actions[0]);
        this.change();
    }

    onSelectInteraction(interaction: IChannelAction) {
        if (!interaction) return;

        this.interaction = interaction;
        this.interactionComponent = getInteractionComponent(this.interaction.type);
        this.change();
    }

    onSelectContent({ content, contentMetadata }: { content: string; contentMetadata: any }) {
        this.content = content;
        this.contentMetadata = contentMetadata;
        this.change();
    }

    change() {
        if (this.platform.type === undefined) return;
        this.$emit('change', {
            platform: this.platform.type,
            interaction: this.interaction.type,
            content: this.content,
            contentMetadata:
                typeof this.contentMetadata === 'object' ? JSON.stringify(this.contentMetadata) : this.contentMetadata,
        });
    }
}
</script>
