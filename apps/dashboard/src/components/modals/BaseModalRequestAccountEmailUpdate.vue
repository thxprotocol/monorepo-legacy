<template>
    <b-modal
        size="lg"
        title="Your e-mail address is missing!"
        no-close-on-backdrop
        no-close-on-esc
        centered
        no-fade
        hide-header-close
        :hide-footer="true"
        id="modalRequestAccountEmailUpdate"
    >
        <p class="text-muted">
            In order for us to deliver the best product experience we require your e-mail address. We promise not too
            spam you too much!
        </p>
        <b-alert show variant="warning">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Please visit your account page, provide and confirm your email address.
        </b-alert>
        <b-button block class="rounded-pill mt-3" variant="primary" :to="'/account'">
            Set e-mail address
            <i class="fas fa-chevron-right ml-2"></i>
        </b-button>
        <b-button block class="rounded-pill mt-3 text-muted" variant="link" :to="'/signout'"> Signout </b-button>
    </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalRequestAccountEmailUpdate extends Vue {}
</script>
