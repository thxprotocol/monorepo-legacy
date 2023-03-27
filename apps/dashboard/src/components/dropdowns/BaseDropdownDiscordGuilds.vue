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
        <b-form-group label="Invite URL" description="Make sure to set the correct expiry for this link in Discord.">
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

    @Prop({ required: false }) item!: string;

    mounted() {
        this.serverId = this.item ? this.item : '';
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
