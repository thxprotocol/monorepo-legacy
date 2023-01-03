<template>
    <b-spinner variant="primary"></b-spinner>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class Redirect extends Vue {
    async mounted() {
        await this.$store.dispatch('account/signinRedirectCallback');
        await this.$store.dispatch('account/getProfile');
        this.$router.push('/');
    }
}
</script>
