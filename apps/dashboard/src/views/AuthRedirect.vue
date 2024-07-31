<template>
    <div class="h-100 d-flex align-items-center justify-content-center">
        <b-container class="py-5">
            <b-row>
                <b-col md="6" offset-md="3">
                    <b-alert v-model="isAlertDangerShown" variant="danger" class="p-2">
                        <i class="fas fa-exclamation-circle mx-2" />
                        {{ error }}
                    </b-alert>
                    <b-alert v-model="isAlertSuccessShown" variant="success" class="p-2">
                        <i class="fas fa-check-circle mx-2" />
                        We have connected your account, you can continue!
                    </b-alert>
                    <div class="text-center">
                        <b-button class="px-5" variant="primary" @click="onClickClose"> Close this window </b-button>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { track } from '@thxnetwork/common/mixpanel';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { supabase } from '@thxnetwork/dashboard/store/modules/auth';

@Component({
    computed: {
        ...mapState('auth', {
            session: 'session',
        }),
        ...mapGetters({
            account: 'account/profile',
        }),
    },
})
export default class ViewAuthRedirect extends Vue {
    pools!: IPools;
    account!: TAccount;
    error = '';

    get isAlertDangerShown() {
        return this.error !== '';
    }
    get isAlertSuccessShown() {
        return !this.error;
    }
    async created() {
        // Start listening for signed_in event
        supabase.auth.onAuthStateChange(async (event, session) => {
            // Wait until signed in and close the window
            if (event === 'SIGNED_IN') {
                // Connect any new identities
                track('UserSignsIn', [this.account]);
            }
        });
    }

    async mounted() {
        // Check query params for error
        if (this.$route.query.error) {
            this.error = this.$route.query.error_description as string;
        }
    }

    onClickClose() {
        window.close();
    }
}
</script>
