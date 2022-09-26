<template>
    <div class="center-center h-100">
        <b-spinner variant="primary"></b-spinner>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BSpinner } from 'bootstrap-vue';

@Component({
    components: { 'b-spinner': BSpinner },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class Redirect extends Vue {
    busy = false;
    error = '';

    async mounted() {
        try {
            await this.$store.dispatch('account/signinRedirectCallback');
            await this.$store.dispatch('account/getProfile');

            this.$router.push('/');
        } catch (error) {
            this.error = (error as Error).toString();
        }
    }
}
</script>
