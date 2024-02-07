<template>
    <div>
        <b-form-group
            label="Server ID"
            description="Enable 'Developer Mode' in 'App settings' > 'Advanced' and right click your server icon to Copy ID. "
        >
            <b-input-group prepend="#">
                <b-form-input @change="onChangeServerId" :value="serverId" />
            </b-input-group>
        </b-form-group>
        <b-form-group label="Invite URL">
            <b-form-input @change="onChangeInviteURL" :value="inviteURL" />
        </b-form-group>
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
