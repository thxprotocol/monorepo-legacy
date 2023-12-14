<template>
    <b-dropdown
        variant="light"
        class="w-100"
        menu-class="w-100"
        toggle-class="justify-content-between align-items-center d-flex form-control"
    >
        <template #button-content>
            <span
                :style="{
                    color: selectedDiscordRole && String(selectedDiscordRole.color),
                }"
            >
                {{ selectedDiscordRole ? selectedDiscordRole.name : 'Choose a server role...' }}
            </span>
        </template>
        <b-dropdown-group v-for="(guild, k) of guilds" :header="guild.name" :key="k" class="p-0">
            <b-dropdown-item
                v-for="(role, key) of guild.roles"
                @click="$emit('click', role)"
                :key="key"
                :style="{ color: role.color }"
            >
                <b-badge
                    class="p-2"
                    :style="{
                        backgroundColor: String(role.color),
                        color: 'white',
                    }"
                >
                    {{ role.name }}
                </b-badge>
            </b-dropdown-item>
        </b-dropdown-group>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TDiscordGuild } from '@thxnetwork/types/interfaces';

function getRoleById(guilds, roleId) {
    return guilds.flatMap((guild) => guild.roles).find((role) => role.id === roleId);
}

@Component({})
export default class ModalRewardCustomCreate extends Vue {
    @Prop() roleId!: string;
    @Prop() guilds!: TDiscordGuild[];

    get selectedDiscordRole() {
        if (!this.guilds || !this.guilds.length) return;
        return getRoleById(this.guilds, this.roleId);
    }
}
</script>
