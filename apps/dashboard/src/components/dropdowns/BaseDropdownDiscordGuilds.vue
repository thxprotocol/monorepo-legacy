<template>
    <div>
        <BaseFormGroup
            required
            label="Server ID"
            description="In Discord enable 'Developer Mode' in 'App settings' > 'Advanced', right click your server icon and click Copy ID. "
            tooltip="Select the server the campaign participant is required to join for this quest."
        >
            <b-input-group prepend="#">
                <b-form-input @change="onChangeServerId" :value="serverId" />
            </b-input-group>
        </BaseFormGroup>
        <BaseFormGroup
            label="Invite URL"
            tooltip="This Invite URL will be shown to the campaign participant that attempts to complete the quest."
        >
            <b-form-input @change="onChangeInviteURL" :value="inviteURL" />
        </BaseFormGroup>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownDiscordGuilds extends Vue {
    serverId = '';
    inviteURL = '';

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;

    mounted() {
        this.serverId = this.content ? this.content : '';
        if (this.contentMetadata) {
            const { inviteURL } = this.contentMetadata;
            this.inviteURL = inviteURL;
        }
    }

    onChangeServerId(serverId: string) {
        this.serverId = serverId;
        this.$emit('selected', {
            content: this.serverId,
            contentMetadata: {
                serverId: this.serverId,
                inviteURL: this.inviteURL,
            },
        });
    }

    onChangeInviteURL(url: string) {
        this.inviteURL = url;
        this.$emit('selected', {
            content: this.serverId,
            contentMetadata: {
                serverId: this.serverId,
                inviteURL: this.inviteURL,
            },
        });
    }
}
</script>
