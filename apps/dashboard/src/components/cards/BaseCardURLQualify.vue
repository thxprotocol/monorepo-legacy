<template>
    <b-card body-class="bg-light p-0" class="mb-3">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-url-qualify
        >
            <strong>URL Qualification</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-url-qualify" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <p class="text-muted">
                    Make sure the loyalty widget is running on your success page in order to use URL qualification.
                </p>
                <b-form-group label="Success URL">
                    <b-form-input :value="url" @input="$emit('input', $event)" />
                    <p class="small text-muted mt-2 mb-0">
                        When the user receiving the referral URL comes across this URL the referral will be marked as
                        successful.
                        <strong>E.g. https://example.com/thanks-for-your-signup</strong>
                    </p>
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import { Component, Prop, Vue } from 'vue-property-decorator';

hljs.registerLanguage('xml', XML);

@Component({})
export default class BaseCardURLQualify extends Vue {
    isVisible = true;

    @Prop() url!: string;
}
</script>
