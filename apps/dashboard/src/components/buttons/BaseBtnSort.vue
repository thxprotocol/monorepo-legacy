<template>
    <b-link class="text-muted" @click="onClick">
        <slot></slot>
        <i class="fas ml-2" :class="iconClass" />
    </b-link>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

const CARET_UP = 'fa-caret-up';
const CARET_DOWN = 'fa-caret-down';

@Component({})
export default class BaseBtnToggleArchive extends Vue {
    direction = 'desc';
    iconClass = CARET_UP;

    onClick() {
        if (this.direction === 'asc') {
            this.direction = 'desc';
            this.iconClass = CARET_DOWN;
        } else {
            this.direction = 'asc';
            this.iconClass = CARET_UP;
        }

        this.$emit('click', this.direction);
    }
}
</script>
