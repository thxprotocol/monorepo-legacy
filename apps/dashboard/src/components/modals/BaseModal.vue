<template>
    <b-modal
        @show="onShow"
        @hidden="$emit('hidden')"
        :no-close-on-backdrop="true"
        :title="title"
        :size="size || 'lg'"
        :id="id"
        centered
    >
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
    @Prop() error!: string;
    @Prop() hideFooter!: boolean;

    onShow() {
        track('UserOpens', [this.profile.sub, this.id || 'unknown']);
        this.$emit('show');
    }
}
</script>
