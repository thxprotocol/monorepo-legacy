<template>
    <b-modal
        :size="size || 'lg'"
        @show="onShow"
        @hidden="$emit('hidden')"
        :title="title"
        :id="id"
        no-close-on-backdrop
        centered
        :body-bg-variant="loading ? 'light' : 'white'"
        :hide-footer="loading || hideFooter"
        :hide-header="loading"
    >
        <div class="w-100 center-center bg-light py-3" v-if="loading">
            <div class="text-center w-100">
                <b-spinner variant="gray" class="mb-3" />
                <p class="text-muted">{{ info }}</p>
            </div>
        </div>
        <b-alert variant="danger" show v-if="error">
            {{ error }}
        </b-alert>
        <slot name="modal-body"></slot>
        <template v-slot:modal-footer="{}">
            <slot name="btn-primary"></slot>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { track } from '@thxnetwork/common/mixpanel';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseModal extends Vue {
    interval: any = null;
    info = '';
    profile!: TAccount;

    @Prop() id!: string;
    @Prop() size!: string;
    @Prop() title!: string;
    @Prop() loading!: boolean;
    @Prop() error!: string;
    @Prop() hideFooter!: boolean;

    mounted() {
        const messages = [
            'Preparing network request...',
            'Sending network request...',
            'Interacting with the network...',
            'Reading data from the network...',
            'Preparing network response...',
        ];
        let index = 0;
        this.info = messages[index];
        this.interval = setInterval(() => {
            if (index >= messages.length) index = 0;
            this.info = messages[index++];
        }, 3000);
    }

    onShow() {
        track('UserOpens', [this.profile.sub, this.id || 'unknown']);
        this.$emit('show');
    }

    beforeDestroy() {
        clearInterval(this.interval);
        this.interval = null;
    }
}
</script>
