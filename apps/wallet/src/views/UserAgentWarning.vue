<template>
    <div class="py-5">
        <b-row>
            <b-col offset-md="2" md="8">
                <b-alert variant="warning" show>
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    In-app browsing on Android is not supported.
                </b-alert>
                <p>
                    To continue claiming your
                    <strong class="text-primary"> {{ decodedHash.tokenSymbol }} </strong>, click
                    <strong>Open in Chrome</strong> from the dropdown in the upper right corner.
                </p>
                <img
                    width="100%"
                    height="auto"
                    :src="require('@thxnetwork/wallet/../public/assets/img/screenshot-android.png')"
                />
                <hr />
                <div class="text-center text-muted">or copy and open it yourself</div>
                <hr />
                <b-input-group prepend="URL" class="mt-3">
                    <b-form-input :value="rewardUrl" disabled></b-form-input>
                    <b-input-group-append>
                        <b-button v-clipboard:copy="rewardUrl" variant="primary">
                            <i class="fas fa-clipboard text-white mr-2"></i>
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>
    </div>
</template>

<script lang="ts">
import { BASE_URL } from '@thxnetwork/wallet/utils/secrets';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {},
})
export default class UserAgentWarning extends Vue {
    navigator = window.navigator;
    rewardUrl = '';
    decodedHash = {};

    async mounted() {
        const hash = String(this.$router.currentRoute.query.hash);
        this.rewardUrl = BASE_URL + '/claim?hash=' + hash;

        if (hash && this.navigator.userAgent.match('Android.*Version/')) {
            this.decodedHash = JSON.parse(atob(hash));
        } else {
            this.$router.push('/claim?hash=' + hash);
        }
    }
}
</script>
