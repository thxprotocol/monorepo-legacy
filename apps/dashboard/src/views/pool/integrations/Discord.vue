<template>
    <div>
        <b-alert show variant="warning" v-if="!account.discordAccess" class="d-flex align-items-center">
            <i class="fab fa-discord mr-2" />
            Please connect your Discord account!
            <b-button size="sm" variant="primary" to="/account" class="ml-auto">Connect Discord</b-button>
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
                <b-form-group>
                    <template #label>
                        <div class="d-flex align-items-center">
                            Connections
                            <b-button
                                :href="discordBotInviteUrl"
                                target="_blank"
                                variant="light"
                                size="sm"
                                class="ml-auto"
                            >
                                <b-img
                                    width="20"
                                    :src="require('../../../../public/assets/logo-discord.png')"
                                    class="mr-1"
                                />
                                Invite THX Bot
                                <i class="fas fa-external-link-alt" />
                            </b-button>
                        </div>
                    </template>
                    <BaseDropdownSelectMultiple :options="options" @select="onSelectGuild" @remove="onRemoveGuild" />
                </b-form-group>
                <b-form-group label="Commands">
                    <b-badge variant="light" class="p-2 mr-2 font-weight-normal">
                        <code>/quests</code>
                    </b-badge>
                    <b-badge variant="light" class="p-2 mr-2 font-weight-normal">
                        <code>/info</code>
                    </b-badge>
                    <b-badge variant="light" class="p-2 mr-2 font-weight-normal">
                        <code>/give-points</code> :member :amount :secret
                    </b-badge>
                    <b-badge variant="light" class="p-2 mr-2 font-weight-normal">
                        <code>/remove-points</code> :member :amount :secret
                    </b-badge>
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <div class="">
                    <strong>Security</strong>
                    <p class="text-muted">
                        Configure role access to the <code>/give-points</code> and <code>/remove-points</code> commands
                        and an optional secret.
                    </p>
                </div>
            </b-col>
            <b-col md="8">
                <div :key="key" v-for="(guild, key) of guilds">
                    <b-form-group :label="guild.name">
                        <BaseDropdownDiscordRole
                            :role-id="guild.adminRoleId"
                            :guild="guild"
                            @click="onClickDiscordRole(guild, $event)"
                        />
                    </b-form-group>
                    <b-form-group label="Secret">
                        <b-form-input type="text" :value="guild.secret" @change="onChangeGuildSecret(guild, $event)" />
                    </b-form-group>
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
                <b-form-group :label="guild.name" :key="key" v-for="(guild, key) of guilds">
                    <BaseDropdownDiscordChannel
                        @click="updateDiscordGuild"
                        :channel-id="guild.channelId"
                        :guild="guild"
                    />
                    <div class="d-flex mt-2">
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
import type { TAccount, TDiscordGuild, TDiscordRole } from '@thxnetwork/types/interfaces';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import BaseDropdownDiscordChannel from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordChannel.vue';
import BaseDropdownDiscordRole from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordRole.vue';
import BaseDropdownSelectMultiple from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownSelectMultiple.vue';
import { TAvailableGuild } from '@thxnetwork/dashboard/store/modules/account';

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
            guildList: 'pools/guilds',
            account: 'account/profile',
            availableGuilds: 'account/guilds',
        }),
    },
})
export default class IntegrationDiscordView extends Vue {
    BASE_URL = BASE_URL;
    discordBotInviteUrl = DISCORD_BOT_INVITE_URL;
    isChecked = true;

    account!: TAccount;
    pools!: IPools;
    availableGuilds!: TAvailableGuild[];
    guildList!: TGuildState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get guilds() {
        if (!this.guildList[this.$route.params.id]) return [];
        return Object.values(this.guildList[this.$route.params.id]);
    }

    get options() {
        if (!this.availableGuilds) return [];
        return this.availableGuilds
            .filter((guild: TAvailableGuild) => (guild.permissions & 0x00000008) === 0x00000008)
            .map((guild: TAvailableGuild) => {
                const g = this.guilds.find((g: TDiscordGuild) => g.guildId === guild.id);
                return {
                    img: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
                    label: guild.name,
                    value: { _id: g?._id, guildId: guild.id, name: guild.name, poolId: this.pool._id },
                    disabled: !!g,
                    selected: !!g,
                    icon: g && {
                        variant: g.isInstalled ? 'success' : 'danger',
                        class: g.isInstalled ? 'fas fa-check' : 'fas fa-exclamation',
                    },
                };
            });
    }

    mounted() {
        this.$store.dispatch('account/getGuilds');
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
        this.$store.dispatch('pools/read', guild.poolId);

        window.open(this.discordBotInviteUrl, '_blank');
    }

    onRemoveGuild(guild: TDiscordGuild) {
        this.$store.dispatch('pools/removeGuild', guild);
    }
}
</script>
