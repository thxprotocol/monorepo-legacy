<template>
    <div>
        <!-- <b-form-row>
            <b-col md="4">
                <strong>Discord Bot</strong>
                <p class="text-muted">Install THX Bot to increase engagement in your Discord server.</p>
            </b-col>
            <b-col md="8">
                <b-alert show variant="info" class="d-flex align-items-center py-2">
                    <i class="fab fa-discord mr-2"></i>
                    Install THX Bot to increase engagement in your Discord server.
                    <b-button class="rounded-pill ml-auto" size="sm" variant="primary" :href="urlDiscordBotInstall">
                        Install
                        <i class="fas fa-chevron-right"></i>
                    </b-button>
                </b-alert>
                <b-row>
                    <b-col md="3">
                        <span class="mr-2">
                            <i class="fas fa-check-circle mr-1 text-success"></i>
                            Unlocks Discord reward conditions!
                        </span>
                    </b-col>
                    <b-col md="3">
                        <span class="mr-2">
                            <i class="fas fa-check-circle mr-1 text-success"></i>
                            Personal & Balance<br /><code>/thx me</code>
                        </span>
                    </b-col>
                    <b-col md="3">
                        <span class="mr-2">
                            <i class="fas fa-check-circle mr-1 text-success"></i>
                            Rewards & Perks<br /><code>/thx info</code>
                        </span>
                    </b-col>
                    <b-col md="3">
                        <span class="mr-2">
                            <i class="fas fa-check-circle mr-1 text-success"></i>
                            Leaderboard<br /><code>/thx leaderboard</code>
                        </span>
                    </b-col>
                </b-row>
            </b-col>
        </b-form-row>
        <hr /> -->
        <b-form-row>
            <b-col md="4">
                <strong>Discord Notifications</strong>
                <p class="text-muted">Sends a notification message for all quests you publish.</p>
            </b-col>
            <b-col md="8">
                <b-form-group label="Webhook URL" description="">
                    <b-form-input
                        :state="isValidDiscordWebhookUrl"
                        :value="discordWebhookUrl"
                        @change="onChangeDiscordWebhookUrl"
                    ></b-form-input>
                </b-form-group>
                <b-card v-if="isValidDiscordWebhookUrl" body-class="bg-light">
                    <b-form-group label="Message" class="mb-0">
                        <b-form-textarea v-model="defaultDiscordMessage" @change="updateSettings()" />
                    </b-form-group>
                </b-card>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Twitter Automation</strong>
                <p class="text-muted">
                    Detects new tweets every 15min and automatically creates a retweet reward for the detected tweet.
                </p>
            </b-col>
            <b-col md="8">
                <b-alert show variant="warning" v-if="profile && !profile.twitterAccess">
                    <i class="fab fa-twitter mr-2"></i>
                    <b-link @click="$store.dispatch('account/connect', AccessTokenKind.Twitter)">
                        Connect your Twitter account
                    </b-link>
                    to benefit from reward automation.
                </b-alert>
                <b-form-group>
                    <b-form-checkbox
                        v-model="isTwitterSyncEnabled"
                        :disabled="!isTwitterSyncEnabled && profile && !profile.twitterAccess"
                        @change="updateSettings"
                        class="m-0"
                    >
                        Enable automated <strong>Twitter (RP) Quests</strong> for
                        <code>@{{ profile.twitterUsername }}</code>
                    </b-form-checkbox>
                </b-form-group>
                <b-card v-if="isTwitterSyncEnabled" body-class="bg-light">
                    <b-form-group
                        label="Hashtag filter"
                        description="Will only create quests for posts containing the provided hashtag. Leave empty to create quests for all posts created by the account!"
                    >
                        <b-input-group prepend="#">
                            <b-form-input v-model="defaultConditionalHashtag" @change="updateSettings" />
                        </b-input-group>
                    </b-form-group>
                    <hr />
                    <b-form-group label="Quest settings" class="mb-0">
                        <b-form-group>
                            <b-row>
                                <b-col md="8">
                                    <b-form-input
                                        placeholder="Quest title"
                                        v-model="defaultConditionalRewardTitle"
                                        @change="updateSettings"
                                    />
                                </b-col>
                                <b-col md="4">
                                    <b-form-input
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
                                placeholder="Quest description"
                                v-model="defaultConditionalRewardDescription"
                                @change="updateSettings"
                            />
                        </b-form-group>
                        <b-form-group class="mb-0">
                            <b-form-checkbox v-model="defaultConditionalRewardIsPublished" @change="updateSettings">
                                Publish new quests instantly
                            </b-form-checkbox>
                        </b-form-group>
                    </b-form-group>
                </b-card>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import type { TAccount } from '@thxnetwork/types/interfaces';
import { AccessTokenKind, RewardConditionInteraction, TPoolSettings } from '@thxnetwork/types/index';
import { BASE_URL, DISCORD_CLIENT_ID } from '@thxnetwork/dashboard/utils/secrets';
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
    urlDiscordBotInstall =
        DISCORD_CLIENT_ID &&
        `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=133120&scope=bot`;
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
