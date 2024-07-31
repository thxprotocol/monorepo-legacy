<template>
    <div class="text-center text-gray py-5 mx-auto" style="max-width: 500px">
        <i class="far fa-sticky-note mr-1 h2"></i><br />
        <strong> {{ title }}</strong>
        <br />
        <p>
            {{ description }}
            <span>Let's add one now!</span>
        </p>

        <b-button
            :disabled="disabled"
            size="sm"
            class="rounded-pill mt-3"
            variant="outline-primary"
            @click="$emit('clicked')"
        >
            {{ textSubmit }}
        </b-button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseListStateEmpty extends Vue {
    @Prop() textSubmit!: string;
    @Prop() title!: string;
    @Prop() description!: string;
    @Prop() disabled!: boolean;
}
</script>
