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
        <b-form-group label="Treshold" description="The amount of used invite links for a discord user">
            <b-form-input @change="onChangeTreshold" :value="treshold" />
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownInviteUsed extends Vue {
    serverId = '';
    treshold: number | null = null;
    inviteURL = '';

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;

    mounted() {
        this.serverId = this.content ? this.content : '';
        this.treshold = this.contentMetadata ? this.contentMetadata.treshold : null;
        this.inviteURL = this.contentMetadata ? this.contentMetadata.inviteURL : '';
    }

    onChangeServerId(serverId: string) {
        this.serverId = serverId;
        this.$emit('selected', {
            content: this.serverId,
            contentMetadata: {
                serverId: this.serverId,
                treshold: this.treshold,
            },
        });
    }

    onChangeTreshold(treshold: number) {
        this.treshold = treshold;
        this.$emit('selected', {
            content: this.serverId,
            contentMetadata: {
                serverId: this.serverId,
                treshold: this.treshold,
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
                treshold: this.treshold,
                inviteURL: this.inviteURL,
            },
        });
    }
}
</script>
