<template>
    <div>
        <h2 class="mb-3">Integrations</h2>
        <BCard class="shadow-sm mb-5" no-body v-if="pool">
            <b-tabs card pills active-nav-item-class="rounded-pill">
                <b-tab active>
                    <template #title>
                        <i class="fab fa-discord mr-1" />
                        Discord
                    </template>
                    <b-form-row>
                        <b-col md="4">
                            <div class="">
                                <strong>Bot</strong>
                                <p class="text-muted">
                                    Track member engagement for Discord Quests and unlock Discord Role Rewards.
                                </p>
                            </div>
                        </b-col>
                        <b-col md="8">
                            <b-form-group label="Discord Server">
                                <b-button variant="light" target="_blank" :href="discordBotInviteUrl">
                                    <b-img
                                        :src="require('../../../public/assets/logo-discord.png')"
                                        width="25"
                                        class="mr-2"
                                    />
                                    Invite THX Bot
                                </b-button>
                                <template #description>
                                    Run the command <code>/thx connect</code> after the invite from an admin role to
                                    connect the bot to a campaign you own or collaborate with.
                                </template>
                            </b-form-group>
                            <b-form-group label="Installed in" v-if="pool.guilds && pool.guilds.length">
                                <b-badge
                                    v-for="(guild, key) of pool.guilds"
                                    variant="primary"
                                    :key="key"
                                    class="p-2 font-weight-normal center-center d-inline-flex mr-2"
                                >
                                    {{ guild.name }}
                                </b-badge>
                            </b-form-group>
                        </b-col>
                    </b-form-row>
                    <hr />
                    <b-form-row>
                        <b-col md="4">
                            <div class="">
                                <strong>Management</strong>
                                <p class="text-muted">
                                    Determine the roles that should be able to access administrative features.
                                </p>
                            </div>
                        </b-col>
                        <b-col md="8">
                            <b-alert show variant="info" v-if="pool.guilds && !pool.guilds.length">
                                <i class="fab fa-discord mr-2" />
                                Please invite THX Bot and connect your Discord server.
                            </b-alert>
                            <b-form-group :label="guild.name" :key="key" v-for="(guild, key) of pool.guilds">
                                <BaseDropdownDiscordRole
                                    :role-id="guild.adminRoleId"
                                    :guilds="pool.guilds"
                                    @click="updateDiscordAdminRole(guild, $event)"
                                />
                            </b-form-group>
                            <small>
                                Gives access to: <code>/thx give-points</code>, <code>/thx remove-points</code>
                            </small>
                        </b-col>
                    </b-form-row>
                    <hr />
                    <b-form-row>
                        <b-col md="4">
                            <div class="">
                                <strong>Notifications</strong>
                                <p class="text-muted">
                                    Let your Discord members know about campaign events and gain more participants.
                                </p>
                            </div>
                        </b-col>
                        <b-col md="8">
                            <b-alert show variant="info" v-if="pool.guilds && !pool.guilds.length">
                                <i class="fab fa-discord mr-2" />
                                Please invite THX Bot and connect your Discord server.
                            </b-alert>
                            <b-form-group label="Events" description="">
                                <div class="d-flex">
                                    <b-form-checkbox class="mr-2 mb-2" :checked="isChecked" disabled>
                                        Quest Publish
                                    </b-form-checkbox>
                                    <b-form-checkbox class="mr-2 mb-2" :checked="isChecked" disabled>
                                        Quest Complete
                                    </b-form-checkbox>
                                    <b-form-checkbox class="mr-2 mb-2" :checked="false" disabled>
                                        Reward Publish
                                    </b-form-checkbox>
                                    <b-form-checkbox class="mr-2 mb-2" :checked="false" disabled>
                                        Reward Payment
                                    </b-form-checkbox>
                                </div>
                            </b-form-group>
                            <b-form-group :label="guild.name" :key="key" v-for="(guild, key) of pool.guilds">
                                <BaseDropdownDiscordChannel
                                    @click="updateDiscordGuild"
                                    :channel-id="guild.channelId"
                                    :guild="guild"
                                />
                            </b-form-group>
                        </b-col>
                    </b-form-row>
                </b-tab>
                <b-tab>
                    <template #title>
                        <i class="fab fa-twitter mr-1" />
                        Twitter
                    </template>
                    <b-form-row>
                        <b-col md="4">
                            <div>
                                <strong>Automated Quests</strong>
                            </div>
                            <p class="text-muted">
                                Reduce campaign management with automated Repost & Like Quests for your tweets.
                            </p>
                        </b-col>
                        <b-col md="8" v-if="pool.owner">
                            <b-alert
                                show
                                variant="warning"
                                v-if="!pool.owner.twitterAccess && pool.owner.sub === profile.sub"
                            >
                                <i class="fab fa-twitter mr-2"></i>
                                <b-link @click="$store.dispatch('account/connect', AccessTokenKind.Twitter)">
                                    Connect your Twitter account
                                </b-link>
                                to enable Twitter quest automation.
                            </b-alert>
                            <b-form-group
                                description="Searches for new posts in your connected account every 15 minutes"
                            >
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
                </b-tab>
            </b-tabs>
        </BCard>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { AccessTokenKind, RewardConditionInteraction, TPoolSettings } from '@thxnetwork/types/index';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { DISCORD_BOT_INVITE_URL } from '@thxnetwork/dashboard/config/constants';
import type { TAccount, TDiscordGuild, TDiscordRole } from '@thxnetwork/types/interfaces';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import BaseDropdownDiscordChannel from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordChannel.vue';
import BaseDropdownDiscordRole from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordRole.vue';

@Component({
    components: {
        BaseCardURLWebhook,
        BaseDropdownDiscordChannel,
        BaseDropdownDiscordRole,
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

    get isChecked() {
        return this.isValidDiscordWebhookUrl ? true : this.pool.guilds && this.pool.guilds.length ? true : false;
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

    updateDiscordGuild(guild: TDiscordGuild) {
        this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { guild },
        });
    }

    updateDiscordAdminRole(guild: TDiscordGuild, role: TDiscordRole) {
        this.updateDiscordGuild(Object.assign(guild, { adminRoleId: role.id }));
    }
}
</script>
