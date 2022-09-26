<template>
    <div
        class="d-flex align-items-center justify-content-center overflow-hidden"
        :class="variant ? `bg-${variant}` : ''"
        :style="{
            'width': `${size}px`,
            'height': `${size}px`,
            'border-radius': rounded ? '0.5rem' : 0,
        }"
    >
        <img :height="size / 1.75" :width="size / 1.75" :src="uri" alt="" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseIdenticon extends Vue {
    width = 40;
    height = 40;

    @Prop() size!: number;
    @Prop() variant!: string;
    @Prop() rounded!: boolean;
    @Prop() uri!: string;

    mounted() {
        this.width = this.size || this.width;
        this.height = this.size || this.height;
    }
}
</script>
