<template>
    <div v-if="pool && account">
        <b-alert v-if="pool.owner && isOwner && !discordToken" show variant="primary" class="d-flex align-items-center">
            <i class="fab fa-discord mr-2" />
            Please connect your Discord account!
            <b-button size="sm" variant="primary" @click="onClickConnect" class="ml-auto">Connect Discord</b-button>
        </b-alert>
        <b-form-row>
            <b-col md="4">
                <div class="">
                    <strong>Servers</strong>
                    <p class="text-muted">
                        Track member engagement for Discord Quests and unlock Discord Role Rewards.
                    </p>
                </div>
            </b-col>
            <b-col md="8">
                <b-spinner v-if="isLoading" small />
                <BaseFormGroup
                    v-else
                    label="Connected"
                    tooltip="Invite THX Bot to your server. It will only show in this list if your connected Discord account has MANAGE_SERVER permissions in that server."
                >
                    <BaseDropdownSelectMultiple
                        :disabled="pool.owner && pool.owner.sub !== account.sub"
                        :options="options"
                        @select="onSelectGuild"
                        @remove="onRemoveGuild"
                    />
                    <template #description>
                        Make sure to
                        <b-link :href="discordBotInviteUrl" target="_blank" variant="light" size="sm" class="ml-auto">
                            invite THX Bot
                            <i class="fas fa-external-link-alt" />
                        </b-link>
                        to your server.
                    </template>
                </BaseFormGroup>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Security</strong>
                <p class="text-muted">
                    Configure role access for the point management commands and an optional secret.
                </p>
            </b-col>
            <b-col md="8">
                <div :key="key" v-for="(guild, key) of connectedGuilds">
                    <BaseFormGroup
                        :label="guild.name"
                        required
                        tooltip="Make sure THX Bot is invited to your server and has permissions to read roles."
                    >
                        <BaseDropdownDiscordRole
                            :role-id="guild.adminRoleId"
                            :guild="guild"
                            @click="onClickDiscordRole(guild, $event)"
                        />
                    </BaseFormGroup>
                    <BaseFormGroup
                        label="Secret"
                        tooltip="This secret will be required to be passed as an argument when the allowed role invokes the point management commands."
                    >
                        <b-form-input type="text" :value="guild.secret" @change="onChangeGuildSecret(guild, $event)" />
                    </BaseFormGroup>
                </div>
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
                <BaseCollapseDiscordNotifications
                    v-for="(guild, key) of connectedGuilds"
                    :key="key"
                    :guild="guild"
                    @update="updateDiscordGuild"
                />
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { IPools, TGuildState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { DISCORD_BOT_INVITE_URL } from '@thxnetwork/dashboard/config/constants';
import { AccessTokenKind, OAuthDiscordScope } from '@thxnetwork/common/enums';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import BaseDropdownDiscordChannel from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordChannel.vue';
import BaseDropdownDiscordRole from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordRole.vue';
import BaseDropdownSelectMultiple from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownSelectMultiple.vue';
import BaseCollapseDiscordNotifications from '@thxnetwork/dashboard/components/BaseCollapseDiscordNotifications.vue';

@Component({
    components: {
        BaseCardURLWebhook,
        BaseDropdownSelectMultiple,
        BaseDropdownDiscordChannel,
        BaseDropdownDiscordRole,
        BaseCollapseDiscordNotifications,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            guildList: 'pools/guilds',
            account: 'account/profile',
        }),
    },
})
export default class IntegrationDiscordView extends Vue {
    BASE_URL = BASE_URL;
    discordBotInviteUrl = DISCORD_BOT_INVITE_URL;
    isChecked = true;
    isLoading = false;
    account!: TAccount;
    pools!: IPools;
    guildList!: TGuildState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get isOwner() {
        if (!this.pool.owner) return;
        return this.pool.owner.sub === this.account.sub;
    }

    get guilds() {
        if (!this.guildList[this.$route.params.id]) return [];
        return Object.values(this.guildList[this.$route.params.id]);
    }

    get discordToken() {
        if (!this.pool.owner) return;
        return this.pool.owner.tokens.find(
            ({ kind, scopes }) => kind === AccessTokenKind.Discord && scopes.includes(OAuthDiscordScope.Guilds),
        );
    }

    get options() {
        if (!this.guildList[this.$route.params.id]) return [];
        return Object.values(this.guildList[this.$route.params.id])
            .filter((guild: TDiscordGuild) => (guild.permissions & 0x00000008) === 0x00000008)
            .map((guild: TDiscordGuild) => ({
                img: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
                label: guild.name,
                value: guild,
                disabled: guild.isConnected,
                selected: guild.isConnected,
                icon: guild.isInvited && {
                    variant: guild.isConnected ? 'success' : 'danger',
                    class: guild.isConnected ? 'fas fa-check' : 'fas fa-exclamation',
                },
            }));
    }

    get connectedGuilds() {
        return this.guilds.filter((guild: TDiscordGuild) => guild.isConnected);
    }

    async mounted() {
        if (this.discordToken) {
            this.isLoading = true;
            await this.$store.dispatch('pools/listGuilds', this.pool);
            this.isLoading = false;
        }
    }

    onClickDiscordRole(guild: TDiscordGuild, role: TDiscordRole) {
        this.updateDiscordGuild({ ...guild, adminRoleId: role.id });
    }

    onChangeGuildSecret(guild: TDiscordGuild, secret: string) {
        this.updateDiscordGuild({ ...guild, secret });
    }

    updateDiscordGuild(guild: TDiscordGuild) {
        this.$store.dispatch('pools/updateGuild', guild);
    }

    onSelectGuild(guild: TDiscordGuild) {
        this.$store.dispatch('pools/createGuild', guild);
    }

    onRemoveGuild(guild: TDiscordGuild) {
        this.$store.dispatch('pools/removeGuild', guild);
    }

    onClickConnect() {
        this.$store.dispatch('auth/connect', {
            kind: AccessTokenKind.Discord,
            scopes: [OAuthDiscordScope.Identify, OAuthDiscordScope.Email, OAuthDiscordScope.Guilds],
        });
    }
}
</script>
