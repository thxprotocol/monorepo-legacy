<template>
    <b-link v-b-tooltip :title="title">
        <i class="fas fa-question-circle"></i>
    </b-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseTooltipInfo extends Vue {
    @Prop() title!: string;
}
</script>
