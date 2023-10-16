<template>
    <b-badge variant="light" class="p-2 mr-2 d-inline font-weight-normal" :id="id">
        <i :class="iconClass" class="mr-2"></i>
        <b-progress class="d-inline-flex" show-value :max="max" style="height: 13px; width: 40px">
            <b-progress-bar :value="value" :label="`${(value / max) * 100}%`"></b-progress-bar>
        </b-progress>
        <b-popover :target="id" :title="label" placement="left" triggers="hover focus">
            <slot></slot>
            <div class="text-right"><small class="text-muted">Updates every 15 minutes</small></div>
        </b-popover>
    </b-badge>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseBadgePopover extends Vue {
    @Prop() id!: string;
    @Prop() iconClass!: string;
    @Prop() value!: number;
    @Prop() max!: number;
    @Prop() label!: string;
}
</script>
