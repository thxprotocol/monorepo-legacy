<template>
    <b-modal
        :id="'modalShowPrivateKey'"
        centered
        hide-footer
        scrollable
        title="Export Private Key"
        @show="onShow"
        @hide="onHide"
    >
        <template>
            <b-input-group>
                <b-form-input readonly :value="formPrivateKey" :type="hidden ? 'password' : 'text'" />
                <b-input-group-append>
                    <b-button v-if="!hidden" variant="light" v-clipboard:copy="formPrivateKey">
                        <i class="fas fa-clipboard m-0"></i>
                    </b-button>
                    <b-button v-else variant="light" @click="showKey">
                        <i class="fas fa-eye m-0"></i>
                    </b-button>
                </b-input-group-append>
            </b-input-group>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapState } from 'vuex';

@Component({
    components: {},
    computed: {
        ...mapState('network', ['web3', 'privateKey']),
    },
})
export default class BaseModalShowPrivateKey extends Vue {
    privateKey!: string;

    hidden = true;
    formPrivateKey = '.';

    onShow() {
        this.formPrivateKey = this.formPrivateKey.repeat(this.privateKey.length);
    }

    showKey() {
        this.formPrivateKey = this.privateKey;
        this.hidden = false;
    }

    onHide() {
        this.hidden = true;
        this.formPrivateKey = '.';
    }
}
</script>
