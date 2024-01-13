<template>
    <div>
        <b-form-row>
            <b-col md="4"> </b-col>
            <b-col md="8">
                <b-alert show variant="warning" v-if="!account.discordAccess">
                    <i class="fab fa-discord mr-2" />
                    Please <b-link to="/account">connect your Discord account.</b-link>!
                </b-alert>
            </b-col>
            <b-col md="4">
                <div class="">
                    <strong>Bot</strong>
                    <p class="text-muted">
                        Track member engagement for Discord Quests and unlock Discord Role Rewards.
                    </p>
                </div>
            </b-col>
            <b-col md="8">
                <b-form-group>
                    <b-button variant="light" target="_blank" :href="discordBotInviteUrl">
                        <b-img :src="require('../../../../public/assets/logo-discord.png')" width="25" class="mr-2" />
                        Invite THX Bot
                    </b-button>
                </b-form-group>
                <b-form-group label="Installed in">
                    <BaseDropdownSelectMultiple :options="options" @select="onSelectGuild" @remove="onRemoveGuild" />
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <div class="">
                    <strong>Commands</strong>
                    <p class="text-muted">Onboard users to your campaign in your Discord server.</p>
                </div>
            </b-col>
            <b-col md="8">
                <b-form-group label="Available Commands">
                    <b-badge variant="light" class="p-2 mr-2">
                        <code>/quests</code>
                    </b-badge>
                    <b-badge variant="light" class="p-2 mr-2">
                        <code>/info</code>
                    </b-badge>
                    <b-badge variant="light" class="p-2 mr-2">
                        <code>/give-points</code>
                    </b-badge>
                    <b-badge variant="light" class="p-2 mr-2">
                        <code>/remove-points</code>
                    </b-badge>
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <div class="">
                    <strong>Management</strong>
                    <p class="text-muted">Determine the roles that should be able to access administrative features.</p>
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
                <small> Restricts access to: <code>/give-points</code>, <code>/remove-points</code> </small>
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
                        <b-form-checkbox class="mr-2 mb-2" :checked="false" disabled> Reward Publish </b-form-checkbox>
                        <b-form-checkbox class="mr-2 mb-2" :checked="false" disabled> Reward Payment </b-form-checkbox>
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
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { DISCORD_BOT_INVITE_URL } from '@thxnetwork/dashboard/config/constants';
import type { TAccount, TDiscordGuild, TDiscordRole } from '@thxnetwork/types/interfaces';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import BaseDropdownDiscordChannel from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordChannel.vue';
import BaseDropdownDiscordRole from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordRole.vue';
import BaseDropdownSelectMultiple from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownSelectMultiple.vue';

@Component({
    components: {
        BaseCardURLWebhook,
        BaseDropdownDiscordChannel,
        BaseDropdownDiscordRole,
        BaseDropdownSelectMultiple,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            account: 'account/profile',
            discord: 'account/discord',
        }),
    },
})
export default class IntegrationDiscordView extends Vue {
    BASE_URL = BASE_URL;
    discordBotInviteUrl = DISCORD_BOT_INVITE_URL;
    account!: TAccount;
    pools!: IPools;
    isChecked = true;
    guilds: { id: string; name: string; icon: string }[] = [];

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get options() {
        return this.guilds.map((guild: { id: string; name: string; icon: string }) => {
            const selected = !!this.pool.guilds.find((g: TDiscordGuild) => g.guildId === guild.id);
            return {
                img: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
                label: guild.name,
                value: guild,
                disabled: false,
                selected,
            };
        });
    }

    async mounted() {
        const guilds = await this.$store.dispatch('account/getGuilds');
        this.guilds = guilds.filter((guild) => (guild.permissions & 0x00000008) === 0x00000008);
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

    onSelectGuild(guild) {
        this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { guilds: [...this.pool.guilds, guild] },
        });
    }

    onRemoveGuild(guild) {
        const index = this.pool.guilds.findIndex((g) => g.guildId === guild.id);
        this.pool.guilds.splice(index, 1);
        this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { guilds: this.pool.guilds },
        });
    }
}
</script>
