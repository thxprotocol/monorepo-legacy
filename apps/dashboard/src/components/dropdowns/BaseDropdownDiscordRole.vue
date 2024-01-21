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
        <b-dropdown-item @click="$emit('click', { id: '' })"> None </b-dropdown-item>
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
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TDiscordGuild } from '@thxnetwork/types/interfaces';

@Component({})
export default class BaseDropdownDiscordRole extends Vue {
    @Prop() roleId!: string;
    @Prop() guild!: TDiscordGuild;

    get selectedDiscordRole() {
        if (!this.guild) return;
        return this.guild.roles.find((role) => role.id === this.roleId);
    }
}
</script>
