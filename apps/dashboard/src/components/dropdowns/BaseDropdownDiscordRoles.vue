<template>
    <div>
        <b-spinner v-if="isLoading" small />
        <b-alert show variant="primary" v-else-if="!guilds.length">
            <i class="fas fa-exclamation-circle mr-1" />
            Please
            <b-link :to="`/pool/${pool._id}/integrations/discord`"> invite THX Bot </b-link>
            to your server.
        </b-alert>
        <template v-else>
            <BaseFormGroup
                required
                label="Server"
                :description="!guilds.length ? 'Make sure THX Bot is connected and has sufficient permissions.' : ''"
                tooltip="Select the server the campaign participant is required to join for this quest."
            >
                <b-form-select v-model="guild">
                    <b-form-select-option :key="key" v-for="(g, key) of guilds" :value="guild">
                        {{ g.name }}
                    </b-form-select-option>
                </b-form-select>
            </BaseFormGroup>
            <BaseFormGroup
                v-if="guild"
                required
                label="Role"
                description="Make sure THX Bot is invited and has sufficient permissions."
                tooltip="Select the server role the campaign participant is required to bear."
            >
                <BaseDropdownDiscordRole :role-id="roleId" :guild="guild" @click="onClickRole" />
            </BaseFormGroup>
            <BaseFormGroup
                label="Invite URL"
                tooltip="This Invite URL will be shown to the campaign participant that attempts to complete the quest."
            >
                <b-form-input @change="onChangeInviteURL" :value="inviteURL" />
            </BaseFormGroup>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPools, TGuildState } from '../../store/modules/pools';
import BaseDropdownDiscordRole from './BaseDropdownDiscordRole.vue';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        guildList: 'pools/guilds',
    }),
    components: {
        BaseDropdownDiscordRole,
    },
})
export default class BaseDropdownDiscordRoles extends Vue {
    isLoading = false;
    serverId = '';
    limit = 5;
    days = 7;
    guild: TDiscordGuild | null = null;
    guildList!: TGuildState;
    roleId = '';
    roleName = '';
    roleColor = '';
    inviteURL = '';

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;
    @Prop({ required: false }) amount!: number;

    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get guilds() {
        if (!this.guildList[this.$route.params.id]) return [];
        return Object.values(this.guildList[this.$route.params.id]).filter((guild: TDiscordGuild) => guild.isConnected);
    }

    async mounted() {
        await this.$store.dispatch('pools/listGuilds', this.pool);
        this.isLoading = true;

        this.serverId = this.content ? this.content : this.guilds.length ? this.guilds[0].guildId : this.serverId;
        this.guild = this.guilds.length
            ? this.content
                ? this.guilds.find((guild) => guild.guildId === this.content) || this.guilds[0]
                : this.guilds[0]
            : null;

        if (this.contentMetadata) {
            const { roleId, roleColor, roleName, inviteURL } = this.contentMetadata;
            this.roleId = roleId || this.roleId;
            this.roleName = roleName || this.roleName;
            this.roleColor = roleColor || this.roleColor;
            this.inviteURL = inviteURL || this.inviteURL;
        }
        this.isLoading = false;
    }

    update() {
        this.$emit('selected', {
            content: this.serverId,
            contentMetadata: {
                serverName: this.guild ? this.guild.name : '',
                inviteURL: this.inviteURL,
                serverId: this.serverId,
                roleId: this.roleId,
                roleName: this.roleName,
                roleColor: this.roleColor,
            },
        });
    }

    onClickRole(role: TDiscordRole | null) {
        console.log(role);
        this.roleId = role ? role.id : '';
        this.roleName = role ? role.name : '';
        this.roleColor = role ? role.color : '';
        this.update();
    }

    onChangeInviteURL(url: string) {
        this.inviteURL = url;
        this.update();
    }

    async onClickRetry() {
        this.isLoading = true;
        await this.$store.dispatch('pools/read', this.pool._id);
        this.isLoading = false;
    }
}
</script>
