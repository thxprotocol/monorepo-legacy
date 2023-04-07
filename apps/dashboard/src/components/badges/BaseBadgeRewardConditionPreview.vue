<template>
    <b-badge
        variant="dark"
        class="d-inline-flex p-2 align-items-center justify-content-between"
        v-if="rewardCondition.platform"
    >
        <div class="align-items-center d-flex">
            <img
                v-if="rewardCondition.platform.type !== RewardConditionPlatform.None"
                :src="rewardCondition.platform.logoURI"
                class="mr-2"
                width="auto"
                height="15"
            />
            <span v-if="rewardCondition.interaction">{{ rewardCondition.interaction.name }}</span>
            <span v-if="rewardCondition.contentMetadata.amount">: {{ rewardCondition.contentMetadata.amount }}</span>
        </div>
        <b-link
            :href="getChannelActionURL(rewardCondition.interaction.type, rewardCondition.content)"
            target="_blank"
            class="ml-3"
        >
            <i class="fas text-white fa-external-link-alt ml-1" style="font-size: 0.8rem"></i>
        </b-link>
    </b-badge>
</template>

<script lang="ts">
import { IChannel, IChannelAction } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionPlatform, RewardConditionInteraction } from '@thxnetwork/types/index';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseBadgeRewardConditionPreview extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;

    @Prop() rewardCondition!: {
        platform: IChannel;
        interaction: IChannelAction;
        content: string;
        contentMetadata: any;
    };

    getChannelActionURL(interaction: RewardConditionInteraction, content: string) {
        switch (interaction) {
            case RewardConditionInteraction.YouTubeLike:
                return `https://youtu.be/${content}`;
            case RewardConditionInteraction.YouTubeSubscribe:
                return `https://youtube.com/channel/${content}`;
            case RewardConditionInteraction.TwitterLike:
                return `https://www.twitter.com/twitter/status/${content}`;
            case RewardConditionInteraction.TwitterRetweet:
                return `https://www.twitter.com/twitter/status/${content}`;
            case RewardConditionInteraction.TwitterFollow:
                return `https://www.twitter.com/i/user/${content}`;
            case RewardConditionInteraction.DiscordGuildJoined:
                return this.rewardCondition.contentMetadata.inviteURL;
            case RewardConditionInteraction.DiscordInviteUsed:
                return this.rewardCondition.contentMetadata.inviteURL;
            case RewardConditionInteraction.ShopifyOrderAmount:
            case RewardConditionInteraction.ShopifyTotalSpent:
                return content;
            default:
                return '';
        }
    }
}
</script>
