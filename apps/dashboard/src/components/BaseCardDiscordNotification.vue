<template>
    <b-card header-class="d-flex align-items-center">
        <template #header>
            {{ header }}
            <i class="fas fa-question-circle text-gray ml-auto" v-b-tooltip :title="tooltip" />
        </template>
        <BaseFormGroup label="Channel">
            <BaseDropdownDiscordChannel @click="onClickChannel" :channel-id="channelId" :guild="guild" />
        </BaseFormGroup>
        <BaseFormGroup label="Message" tooltip="You can not use mentions and channel links.">
            <b-form-input :value="message" @change="onChangeMessage" />
        </BaseFormGroup>
        <b-form-checkbox v-model="isEnabled" @change="onCheckEnabled"> Enabled </b-form-checkbox>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseDropdownDiscordChannel from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownDiscordChannel.vue';

@Component({
    components: {
        BaseDropdownDiscordChannel,
    },
})
export default class BaseCardDiscordNotification extends Vue {
    isCollapsed = true;
    channelId = '';
    message = '';
    isEnabled = false;

    @Prop() variant!: string;
    @Prop() header!: string;
    @Prop() tooltip!: string;
    @Prop() guild!: TDiscordGuild;

    mounted() {
        this.channelId = this.guild.notifications[this.variant].channelId;
        this.message = this.guild.notifications[this.variant].message;
        this.isEnabled = this.guild.notifications[this.variant].isEnabled;
    }

    onClickChannel(channelId: string) {
        this.channelId = channelId;
        this.update();
    }

    onChangeMessage(message: string) {
        this.message = message;
        this.update();
    }

    onCheckEnabled(isEnabled: boolean) {
        this.isEnabled = isEnabled;
        this.update();
    }

    update() {
        this.guild.notifications[this.variant] = {
            channelId: this.channelId,
            message: this.message,
            isEnabled: this.isEnabled,
        };
        this.$emit('update', this.guild);
    }
}
</script>
