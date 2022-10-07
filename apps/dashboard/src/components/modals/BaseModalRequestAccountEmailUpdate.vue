<template>
    <b-modal
        size="lg"
        title="Welcome to your token HQ!"
        no-close-on-backdrop
        no-close-on-esc
        centered
        no-fade
        hide-header-close
        :hide-footer="true"
        id="modalRequestAccountEmailUpdate"
    >
        <b-alert show variant="warning">
            <i class="fas fa-exclamation-circle mr-2"></i>
            Your e-mail address is not been set yet.
        </b-alert>
        <p>
            In order for us to deliver the best product experience we require your e-mail address so we can send you
            notifications when certain lengthy tasks are completed.
        </p>
        <p><strong>Please visit your account page, provide and confirm your email address.</strong></p>
        <b-button block class="rounded-pill mt-3" variant="primary" @click="$emit('clicked')" :href="'/account'">
            Visit my account
            <i class="fas fa-chevron-right ml-2"></i>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalRequestAccountEmailUpdate extends Vue {}
</script>
