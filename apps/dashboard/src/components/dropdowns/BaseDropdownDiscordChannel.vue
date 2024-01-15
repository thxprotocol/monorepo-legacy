<template>
    <b-dropdown
        variant="light"
        class="w-100"
        menu-class="w-100 dropdown-menu-scroll"
        toggle-class="justify-content-between align-items-center d-flex form-control"
    >
        <template #button-content>
            <span style="font-family: sans-serif">
                <i class="fas fa-hashtag text-dark mr-2" />
                {{ selectedDiscordChannel ? selectedDiscordChannel.name : 'Choose a notification channel...' }}
            </span>
        </template>
        <b-dropdown-item @click="onClick({ channelId: '' })"> None </b-dropdown-item>
        <b-dropdown-item v-for="(channel, key) of guild.channels" @click="onClick(channel)" :key="key">
            <span style="font-family: sans-serif">
                <i class="fas fa-hashtag text-dark mr-2" />
                {{ channel.name }}
            </span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TDiscordGuild } from '@thxnetwork/types/interfaces';

@Component({})
export default class ModalRewardCustomCreate extends Vue {
    @Prop() channelId!: string;
    @Prop() guild!: TDiscordGuild;

    get selectedDiscordChannel() {
        if (!this.guild.channels || !this.guild.channels.length) return;
        return this.guild.channels.find((channel) => channel.channelId === this.channelId);
    }

    onClick({ channelId }: { channelId: string }) {
        const guild = Object.assign(this.guild, { channelId });
        this.$emit('click', guild);
    }
}
</script>
<style>
.dark-mode .fa-hashtag {
    color: white !important;
}
.dropdown-menu-scroll {
    max-height: 300px;
    overflow: scroll;
}
</style>
