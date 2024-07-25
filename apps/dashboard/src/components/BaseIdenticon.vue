<template>
    <div
        class="d-flex align-items-center justify-content-center overflow-hidden"
        :class="variant ? `bg-${variant}` : ''"
        :style="{
            'width': `${width}px`,
            'height': `${height}px`,
            'border-radius': rounded ? '0.5rem' : 0,
        }"
    >
        <img :height="height / 1.75" :width="width / 1.75" :src="uri" alt="" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseIdenticon extends Vue {
    width = 40;
    height = 40;

    @Prop() size!: string | number;
    @Prop() variant!: string;
    @Prop() rounded!: boolean;
    @Prop() uri!: string;

    mounted() {
        this.width = Number(this.size || this.width);
        this.height = Number(this.size || this.height);
    }
}
</script>
