<template>
    <div>
        <h2 class="mb-3">Integrations</h2>
        <BCard class="shadow-sm mb-5 p-3" no-body v-if="pool">
            <b-form-row>
                <b-col md="4">
                    <div class="">
                        <i class="fab fa-discord mr-2" />
                        <strong>Discord</strong>
                        <p class="text-muted">
                            Add more Discord Quests and let your members know about campaign events
                        </p>
                    </div>
                    <p class="text-muted">.</p>
                </b-col>
                <b-col md="8">
                    <b-form-group label="Discord Server" description="Use THX Bot for Discord Quests and Role Rewards.">
                        <template v-if="pool.guilds && pool.guilds.length">
                            <b-badge
                                variant="dark"
                                :key="key"
                                v-for="(guild, key) of pool.guilds"
                                class="p-2 font-weight-normal center-center d-inline-flex"
                            >
                                <b-img
                                    :src="require('../../../public/assets/logo-discord.png')"
                                    width="20"
                                    class="mr-2"
                                />
                                {{ guild.name }}
                            </b-badge>
                        </template>
                        <template v-else>
                            <b-button variant="light" target="_blank" :href="discordBotInviteUrl">
                                <b-img
                                    :src="require('../../../public/assets/logo-discord.png')"
                                    width="25"
                                    class="mr-2"
                                />
                                Invite THX Bot
                            </b-button>
                        </template>
                    </b-form-group>
                    <b-form-group label="Discord Webhook URL">
                        <b-form-input
                            :state="isValidDiscordWebhookUrl"
                            :value="discordWebhookUrl"
                            @change="onChangeDiscordWebhookUrl"
                        ></b-form-input>
                        <small class="text-muted">
                            Show campaign activity in one of your Discord channels using a
                            <b-link
                                href="https://discordjs.guide/popular-topics/webhooks.html#creating-webhooks"
                                target="_blank"
                            >
                                Discord webhook
                            </b-link>
                        </small>
                    </b-form-group>
                    <b-form-group label="Campaign Events" description="" class="mb-0">
                        <div class="d-flex">
                            <b-form-checkbox class="mr-2 mb-2" :checked="isValidDiscordWebhookUrl" disabled>
                                Quest Publish
                            </b-form-checkbox>
                            <b-form-checkbox class="mr-2 mb-2" :checked="isValidDiscordWebhookUrl" disabled>
                                Quest Complete
                            </b-form-checkbox>
                        </div>
                    </b-form-group>
                </b-col>
            </b-form-row>
            <hr />
            <b-form-row>
                <b-col md="4">
                    <div>
                        <i class="fab fa-twitter mr-2" />
                        <strong>Twitter</strong>
                    </div>
                    <p class="text-muted">Reduce campaign management with automated Twitter Quests</p>
                </b-col>
                <b-col md="8">
                    <b-alert show variant="warning" v-if="!pool.owner.twitterAccess && pool.owner.sub === profile.sub">
                        <i class="fab fa-twitter mr-2"></i>
                        <b-link @click="$store.dispatch('account/connect', AccessTokenKind.Twitter)">
                            Connect your Twitter account
                        </b-link>
                        to enable Twitter quest automation.
                    </b-alert>
                    <b-form-group description="Searches for new posts in your connected account every 15 minutes">
                        <b-form-checkbox
                            v-model="isTwitterSyncEnabled"
                            :disabled="!isTwitterSyncEnabled && profile && !profile.twitterAccess"
                            @change="updateSettings"
                            class="m-0"
                        >
                            Enable automated <strong>Twitter Quests</strong>
                            <template v-if="pool.owner.twitterAccess && pool.owner.twitterUsername">
                                for <code>@{{ pool.owner.twitterUsername }}</code>
                            </template>
                        </b-form-checkbox>
                    </b-form-group>
                    <b-card body-class="bg-light">
                        <b-form-group
                            label="Hashtag filter"
                            description="Leave empty to create quests for all posts created by the account"
                        >
                            <b-input-group prepend="#">
                                <b-form-input
                                    :disabled="!isTwitterSyncEnabled"
                                    v-model="defaultConditionalHashtag"
                                    @change="updateSettings"
                                />
                            </b-input-group>
                        </b-form-group>
                        <hr />
                        <b-form-group label="Default settings" class="mb-0">
                            <b-form-group>
                                <b-row>
                                    <b-col md="8">
                                        <b-form-input
                                            :disabled="!isTwitterSyncEnabled"
                                            placeholder="Quest title"
                                            v-model="defaultConditionalRewardTitle"
                                            @change="updateSettings"
                                        />
                                    </b-col>
                                    <b-col md="4">
                                        <b-form-input
                                            :disabled="!isTwitterSyncEnabled"
                                            placeholder="Points"
                                            type="number"
                                            v-model="defaultConditionalRewardAmount"
                                            @change="updateSettings"
                                        />
                                    </b-col>
                                </b-row>
                            </b-form-group>
                            <b-form-group>
                                <b-form-textarea
                                    :disabled="!isTwitterSyncEnabled"
                                    placeholder="Quest description"
                                    v-model="defaultConditionalRewardDescription"
                                    @change="updateSettings"
                                />
                            </b-form-group>
                            <b-form-group class="mb-0">
                                <b-form-checkbox
                                    v-model="defaultConditionalRewardIsPublished"
                                    :disabled="!isTwitterSyncEnabled"
                                    @change="updateSettings"
                                >
                                    Publish new quests instantly
                                </b-form-checkbox>
                            </b-form-group>
                        </b-form-group>
                    </b-card>
                </b-col>
            </b-form-row>
        </BCard>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import type { TAccount } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, RewardConditionInteraction, TPoolSettings } from '@thxnetwork/types/index';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { DISCORD_BOT_INVITE_URL } from '@thxnetwork/dashboard/config/constants';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';

@Component({
    components: {
        BaseCardURLWebhook,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsTwitterView extends Vue {
    BASE_URL = BASE_URL;
    isCopied = false;
    AccessTokenKind = AccessTokenKind;
    RewardConditionInteraction = RewardConditionInteraction;
    discordBotInviteUrl = DISCORD_BOT_INVITE_URL;
    chainInfo = chainInfo;
    profile!: TAccount;
    pools!: IPools;
    settings: TPoolSettings | null = null;
    isTwitterSyncEnabled = false;
    discordWebhookUrl = '';
    defaultDiscordMessage = '';
    defaultConditionalRewardInteraction = RewardConditionInteraction.TwitterRetweet;
    defaultConditionalHashtag = '';
    defaultConditionalRewardTitle = '';
    defaultConditionalRewardDescription = '';
    defaultConditionalRewardAmount = 0;
    defaultConditionalRewardIsPublished = true;

    get isValidDiscordWebhookUrl() {
        return this.discordWebhookUrl ? this.discordWebhookUrl.startsWith('https://discord.com/api/webhooks/') : null;
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        this.isTwitterSyncEnabled = this.pool.settings.isTwitterSyncEnabled;
        this.discordWebhookUrl = this.pool.settings.discordWebhookUrl;
        this.defaultDiscordMessage = this.pool.settings.defaults.discordMessage;
        this.defaultConditionalHashtag = this.pool.settings.defaults.conditionalRewards.hashtag;
        this.defaultConditionalRewardTitle = this.pool.settings.defaults.conditionalRewards.title;
        this.defaultConditionalRewardDescription = this.pool.settings.defaults.conditionalRewards.description;
        this.defaultConditionalRewardAmount = this.pool.settings.defaults.conditionalRewards.amount;
        this.defaultConditionalRewardIsPublished = this.pool.settings.defaults.conditionalRewards.isPublished;
    }

    async onChangeDiscordWebhookUrl(discordWebhookUrl: string) {
        this.discordWebhookUrl = discordWebhookUrl;
        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { settings: { discordWebhookUrl } },
        });
    }

    async updateSettings() {
        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: {
                settings: {
                    isTwitterSyncEnabled: this.isTwitterSyncEnabled,
                    defaults: {
                        discordMessage: this.defaultDiscordMessage,
                        conditionalRewards: {
                            isPublished: this.defaultConditionalRewardIsPublished,
                            title: this.defaultConditionalRewardTitle,
                            description: this.defaultConditionalRewardDescription,
                            amount: this.defaultConditionalRewardAmount,
                            hashtag: this.defaultConditionalHashtag,
                        },
                    },
                },
            },
        });
    }
}
</script>
