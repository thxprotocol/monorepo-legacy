<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-condition
        >
            <strong>Requirements</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-condition" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <p class="text-gray">Choose what social behavior is required for this quest.</p>
                <b-form-group label="Provider">
                    <BaseDropdownQuestProvider @selected="onSelectProvider" :provider="provider" />
                </b-form-group>
                <b-alert
                    show
                    variant="warning"
                    class="d-flex align-items-center justify-content-between"
                    v-if="!isPlatformAvailable"
                >
                    <div>
                        <i class="fas fa-exclamation-circle mr-1" />
                        Please connect your {{ provider.name }} account!
                    </div>
                    <b-button v-if="provider.kind" @click="onClickConnect(provider)" variant="primary" size="sm">
                        Connect
                    </b-button>
                </b-alert>
                <b-form-group label="Interaction">
                    <BaseDropdownQuestProviderInteractions
                        @change="onSelectProviderInteraction"
                        :interactions="interactions"
                        :interaction="providerInteraction"
                    />
                </b-form-group>
                <component
                    v-if="providerInteraction"
                    :is="interactionComponentMap[providerInteraction.type]"
                    :content="content"
                    :contentMetadata="contentMetadata"
                    @selected="onSelectContent"
                />
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import {
    providerInteractionList,
    getPlatform,
    getInteraction,
    providerList,
    TQuestSocialProvider,
    TQuestSocialInteraction,
} from '@thxnetwork/dashboard/types/rewards';
import { AccessTokenKind, QuestSocialRequirement } from '@thxnetwork/types/enums';
import { TAccount, TPool } from '@thxnetwork/types/interfaces';
import BaseDropdownQuestProvider from '../dropdowns/BaseDropdownQuestProvider.vue';
import BaseDropdownQuestProviderInteractions from '../dropdowns/BaseDropdownQuestProviderInteractions.vue';
import BaseDropdownYoutubeChannels from '../dropdowns/BaseDropdownYoutubeChannels.vue';
import BaseDropdownYoutubeVideo from '../dropdowns/BaseDropdownYoutubeVideo.vue';
import BaseDropdownTwitterTweets from '../dropdowns/BaseDropdownTwitterTweets.vue';
import BaseDropdownTwitterUsers from '../dropdowns/BaseDropdownTwitterUsers.vue';
import BaseDropdownDiscordGuilds from '../dropdowns/BaseDropdownDiscordGuilds.vue';
import BaseDropdownDiscordMessage from '../dropdowns/BaseDropdownDiscordMessage.vue';
import BaseDropdownDiscordMessageReaction from '../dropdowns/BaseDropdownDiscordMessageReaction.vue';
import BaseDropdownTwitterMessage from '../dropdowns/BaseDropdownTwitterMessage.vue';
import { interactionComponentMap } from '@thxnetwork/common/lib/types/maps/oauth';

@Component({
    components: {
        BaseDropdownDiscordGuilds,
        BaseDropdownDiscordMessage,
        BaseDropdownDiscordMessageReaction,
        BaseDropdownQuestProvider,
        BaseDropdownQuestProviderInteractions,
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
export default class BaseCardQuestRequirement extends Vue {
    AccessTokenKind = AccessTokenKind;
    QuestSocialRequirement = QuestSocialRequirement;
    interactionComponentMap = interactionComponentMap;

    isLoadingPlatform = false;
    title = '';
    amount = '0';
    description = '';

    provider: TQuestSocialProvider = providerList[0];
    providerInteraction: TQuestSocialInteraction = providerInteractionList[0];

    kind: AccessTokenKind = AccessTokenKind.Google;
    interaction: QuestSocialRequirement = QuestSocialRequirement.YouTubeLike;
    content = '';
    contentMetadata: unknown = {};
    isVisible = true;
    profile!: TAccount;

    @Prop() pool!: TPool;
    @Prop({ required: false }) requirement!: {
        kind: AccessTokenKind;
        interaction: QuestSocialRequirement;
        content: string;
        contentMetadata: unknown;
    };

    get interactions() {
        return providerInteractionList.filter((a) => this.provider.actions.includes(a.type));
    }

    get isPlatformAvailable() {
        if (!this.provider || !this.provider.kind || !this.pool.owner) return true;
        return this.pool.owner.tokens.find(
            ({ kind, scopes }) =>
                this.provider.kind === kind && this.provider.scopes.every((scope) => scopes.includes(scope)),
        );
    }

    async mounted() {
        if (this.requirement) {
            this.provider = getPlatform(this.requirement.kind) || providerList[0];
            this.kind = this.requirement.kind;
            this.providerInteraction = getInteraction(this.requirement.interaction) || providerInteractionList[0];
            this.interaction = this.requirement.interaction;
            this.content = this.requirement.content;
            this.contentMetadata = this.requirement.contentMetadata;
        }
    }

    async onClickConnect(provider: TQuestSocialProvider) {
        await this.$store.dispatch('account/connect', { kind: provider.kind, scopes: provider.scopes });
    }

    onSelectProvider(provider: TQuestSocialProvider) {
        this.provider = provider;
        this.kind = provider.kind;
        this.content = '';
        this.contentMetadata = {};

        const interaction = getInteraction(provider.actions[0]) as TQuestSocialInteraction;
        this.onSelectProviderInteraction(interaction);
        this.change();
    }

    onSelectProviderInteraction(interaction: TQuestSocialInteraction) {
        if (!interaction) return;

        this.providerInteraction = interaction;
        this.interaction = interaction.type;
        this.content = '';
        this.contentMetadata = {};
        this.change();
    }

    onSelectContent({ content, contentMetadata }: { content: string; contentMetadata: any }) {
        this.content = content;
        this.contentMetadata = contentMetadata;
        this.change();
    }

    change() {
        this.$emit('change', {
            kind: this.kind,
            interaction: this.interaction,
            content: this.content,
            contentMetadata: this.contentMetadata,
        });
    }
}
</script>
